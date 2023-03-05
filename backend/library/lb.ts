export class LoadBalancerProvider {
  network: string;
  url: string;

  constructor(network: string, url: string) {
    this.network = network;
    this.url = url;
  }

  async providerCall(method: string, params: string[]) {
    const output = await fetch(this.url, {
      body: JSON.stringify({
        network: this.network,
        method: method,
        params: params,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return output;
  }
}
