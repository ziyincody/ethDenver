class Provider {
    static prepare(provider: any, metrics: any, options = {}) {
      return {
        id: provider.id,
        provider_url: provider.provider_url,
        object: "provider",
  
        provider_category: provider.provider_category,
        provider_label: provider.provider_label,
        network: provider.network,
        weight: provider.weight,
  
        metrics: metrics,
  
        created_at: new Date(provider.created_at).toISOString(),
        updated_at: new Date(provider.updated_at).toISOString(),
      };
    }
  }
  
  export default Provider;
  