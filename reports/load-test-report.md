# High Concurrency Load Test Report

Generated: 2026-06-29 07:04:40 UTC
Overall Status: PASS

## Concurrency Benchmarks
- **1 User Concurrency**: Latency: 2.1ms | RPS: 480
- **10 Users Concurrency**: Latency: 3.5ms | RPS: 2857
- **50 Users Concurrency**: Latency: 8.2ms | RPS: 6097
- **100 Users Concurrency**: Latency: 15.4ms | RPS: 6493
- **250 Users Concurrency**: Latency: 34.2ms | RPS: 7309
- **500 Users Concurrency**: Latency: 65.4ms | RPS: 7645
- **1000 Users Concurrency**: Latency: 124.8ms | RPS: 8012

## Stress Test Results
- **Total Blasted Requests**: 5,000
- **Peak Request-Per-Second (RPS)**: 8,012
- **Failure Threshold**: 0 failures (0.00% error rate)
- **System Peak Memory Footprint**: 185 MB heap size

## Soak Test Metrics (Memory Stability)
- **Continuous Requests Count**: 2,000
- **Initial Heap Used**: 142.10 MB
- **Final Heap Used**: 158.40 MB
- **Heap Growth Rate**: 8.15% (No leaks detected over soak run)
