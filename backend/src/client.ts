import { LoadBalancerProvider } from "../library/lb";

const loadBalancer = new LoadBalancerProvider(
  "ethereum_goerli",
  "http://localhost:3005/"
);

(async () => {
  let i = 20;
  while (i > 0) {
    const output = await loadBalancer.providerCall("eth_getBlock", ["0x1"]);
    console.log(JSON.parse(await output.json()));
    i--;
  }
})();
