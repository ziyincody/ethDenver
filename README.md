# RPC Aggregator

This tool has a UI, a library and a backend component.
- Backend: The load balancer logic, which the user needs to deploy so that the load balancer can receive traffic
- Library: Allows users to easily make a call to the load balancer
- The UI: allows users add new node to be part of the load balancer, and to adjust the weights. Also shows the usage graph to display the performance across multiple nodes.

# Motivation
The reason I created this is that I feel that any app that makes calls to RPC providers would need something like this since multi-node architecture enables better data availability. By using this repo, users can easily deploy a load balancer that works, as well as a library and a UI to complement.

The tool works the same regardless whether it's a centralized or decentralized provider. E.g. the users can add multiple decentralized nodes if they want to load balance with multiple nodes while maintaining strong decentralization for their apps
