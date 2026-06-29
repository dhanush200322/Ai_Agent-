"use client";

export const EnterpriseIntegrations = () => {
  return (
    <section className="py-24 relative bg-background">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Connects with your ecosystem
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
          AgentOS natively integrates with over 150 enterprise applications.
        </p>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {["Salesforce", "Jira", "Confluence", "Zendesk", "Slack", "Teams", "GitHub", "Notion", "Linear", "Snowflake", "Datadog", "ServiceNow"].map((app, i) => (
            <div key={i} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors cursor-pointer">
              {app}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
