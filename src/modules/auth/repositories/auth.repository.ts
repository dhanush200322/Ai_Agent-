import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { InternalServerError } from '../../../shared/errors/AppError';



export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({ 
      where: { id },
      include: {
        organization: true,
        role: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  async findOrganizationBySlug(slug: string) {
    return prisma.organization.findUnique({ where: { slug } });
  }

  async updateLastLogin(userId: string, ip?: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { 
        lastLogin: new Date(),
        lastLoginIp: ip
      }
    });
  }

  // Transaction for Registration
  async registerTransaction(data: {
    orgName: string;
    orgSlug: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    defaultPermissions: { name: string; resource: string; action: string; category: string }[];
  }) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Create Organization
        const org = await tx.organization.create({
          data: {
            name: data.orgName,
            slug: data.orgSlug,
          }
        });

        // 2. Ensure Permissions Exist
        const permissionIds: string[] = [];
        for (const perm of data.defaultPermissions) {
          const p = await tx.permission.upsert({
            where: { name: perm.name },
            update: {},
            create: {
              name: perm.name,
              resource: perm.resource,
              action: perm.action,
              category: perm.category
            }
          });
          permissionIds.push(p.id);
        }

        // 3. Create Default Roles
        const roleNames = ['Owner', 'Admin', 'Manager', 'Developer', 'Viewer'];
        const createdRoles: Record<string, string> = {};
        
        for (const rName of roleNames) {
          const isOwnerOrAdmin = rName === 'Owner' || rName === 'Admin';
          const role = await tx.role.create({
            data: {
              name: rName,
              organizationId: org.id,
              permissions: isOwnerOrAdmin ? {
                connect: permissionIds.map(id => ({ id }))
              } : undefined
            }
          });
          createdRoles[rName] = role.id;
        }

        // 4. Create Owner User
        const user = await tx.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            passwordHash: data.passwordHash,
            organizationId: org.id,
            roleId: createdRoles['Owner'],
            isOwner: true
          },
          include: {
            organization: true,
            role: true
          }
        });

        return user;
      });
    } catch (error) {
      throw new InternalServerError('Failed to execute registration transaction');
    }
  }
}
