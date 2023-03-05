import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Box,
  Form,
  FormTextInput,
  font,
  Heading,
  colors,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  FormSelect,
} from "triangle-ui";

import api from "../utils/api";
import format from "../utils/format";
import Button from "../components/Button";
import { Card, CardContainer, CardContent } from "../components/Card";
import { Modal } from "../components/Modal";
import TableLinkCell from "../components/TableLinkCell";
import { Text } from "../components/Text";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";
Chart.register(CategoryScale);

const PROVIDER_WHITELIST = ["alchemy", "quicknode", "Pokt", "tenderly", "fluence"];
const NETWORK_LIST = ["ethereum_mainnet", "ethereum_goerli"];

const ProvidersEmpty = () => (
  <CardContent>
    <Box flex={{ alignItems: "center", justifyContent: "center" }} height="128px">
      <Text>You haven't added any providers.</Text>
    </Box>
  </CardContent>
);

const ProvidersError = ({ error }: any) => (
  <CardContent>
    <Box flex={{ alignItems: "center", justifyContent: "center" }} height="128px">
      <Text>Error: {error.message}</Text>
    </Box>
  </CardContent>
);

const ProvidersLoading = () => (
  <CardContent>
    <Box flex={{ alignItems: "center", justifyContent: "center" }} height="128px">
      <Text>Loading...</Text>
    </Box>
  </CardContent>
);

const ProvidersTable = ({ providers }: any) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderCell align="left">Provider Label</TableHeaderCell>
        <TableHeaderCell align="left">Provider Category</TableHeaderCell>
        <TableHeaderCell align="left">Network</TableHeaderCell>
        <TableHeaderCell align="left">Weight</TableHeaderCell>
        <TableHeaderCell align="left" minimized>
          Date Added
        </TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {providers.data.items.map((provider: any) => (
        <TableRow key={provider.id}>
          <TableLinkCell to={`/providers/${provider.id}`}>{provider.provider_label}</TableLinkCell>
          <TableLinkCell to={`/providers/${provider.id}`}>
            {provider.provider_category}
          </TableLinkCell>
          <TableLinkCell to={`/providers/${provider.id}`}>{provider.network}</TableLinkCell>
          <TableLinkCell to={`/providers/${provider.id}`}>{provider.weight}</TableLinkCell>
          <TableLinkCell tabIndex="-1" title={provider.created_at} to={`/providers/${provider.id}`}>
            {format.timestamp(provider.created_at)}
          </TableLinkCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const ProviderList = ({ providers }: { providers: any }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const providerList: any = useMutation<unknown, unknown, any>(
    ({ provider_url, provider_label, provider_category, network, weight }) =>
      api("/v1/providers", {
        body: {
          provider_url,
          provider_label,
          provider_category: provider_category.value,
          network: network.value,
          weight: weight,
        },
        method: "POST",
      }),
    {
      onError: (error: any) => window.alert(error.message),
      onSuccess: () => {
        queryClient.invalidateQueries("providers");
      },
    }
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onAfterClose={() => providerList.reset()}
        onRequestClose={() => setIsOpen(false)}
      >
        <Form
          initialValues={{
            id: "",
            provider_url: "",
            provider_label: "",
            provider_category: "",
            network: "",
            weight: 1,
          }}
          onSubmit={(values: any) => {
            providerList.mutate(values);
          }}
        >
          <CardContainer>
            <CardContent>
              <Text weight="bold">Add a new provider</Text>
            </CardContent>
            <CardContent>
              <>
                <FormSelect
                  // @ts-ignore
                  isDisabled={false}
                  label="Provider Category"
                  // @ts-ignore
                  menuPortalTarget={document.body}
                  name="provider_category"
                  options={PROVIDER_WHITELIST.map((provider) => ({
                    label: provider,
                    value: provider,
                  }))}
                />
                <FormTextInput autoFocus label="Provider URL" name="provider_url" width="100%" />
                <FormTextInput
                  autoFocus
                  label="Provider Label"
                  name="provider_label"
                  width="100%"
                />
                <FormSelect
                  // @ts-ignore
                  isDisabled={false}
                  label="Network"
                  // @ts-ignore
                  menuPortalTarget={document.body}
                  name="network"
                  options={NETWORK_LIST.map((provider) => ({
                    label: provider,
                    value: provider,
                  }))}
                />
                <FormTextInput autoFocus label="Weight" name="weight" width="100%" />
              </>
            </CardContent>
            <CardContent>
              <Box flex={{ justifyContent: "space-between" }}>
                {providerList.data ? <div>Provider added successfully.</div> : <div />}
                <Box>
                  {providerList.data ? (
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                  ) : (
                    <>
                      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                      <Button color="blue" disabled={providerList.isLoading} submit>
                        Create
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </CardContainer>
        </Form>
      </Modal>
      <CardContainer>
        <CardContent>
          <Box flex={{ alignItems: "center", justifyContent: "space-between" }}>
            <Button disabled>Filter</Button>
            <Button onClick={() => setIsOpen(true)}>New</Button>
          </Box>
        </CardContent>
        {providers.isLoading ? (
          <ProvidersLoading />
        ) : providers.error ? (
          <ProvidersError error={providers.error} />
        ) : providers.data.items.length ? (
          <ProvidersTable providers={providers} />
        ) : (
          <ProvidersEmpty />
        )}
        <CardContent>
          <Box flex={{ alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              {providers.data &&
                `${providers.data.items.length} result${
                  providers.data.items.length === 1 ? "" : "s"
                }`}
            </Box>
            <Box>
              <Button disabled>Previous</Button>
              <Button disabled>Next</Button>
            </Box>
          </Box>
        </CardContent>
      </CardContainer>
    </>
  );
};

const ProvidersUsage = ({ providers }: any) => {
  return (
    <CardContainer>
      <CardContent>
        <Box flex={{ alignItems: "center", justifyContent: "space-between" }}>
          <Text size="medium" weight="medium">
            Usage
          </Text>
        </Box>
      </CardContent>
      <CardContent>
        <Line
          data={{
            labels: providers.data.items[0].metrics
              .map((metric: any) => metric.timestamp)
              .reverse(),
            datasets: providers.data.items.map((provider: any) => {
              return {
                label: provider.provider_label,
                data: provider.metrics.map((metric: any) => metric.latency).reverse(),
              };
            }),
          }}
          width={600}
          height={300}
        />
      </CardContent>
    </CardContainer>
  );
};

const Providers = () => {
  const providers = useQuery("providers", () => api("/v1/providers"));
  console.log(providers);
  return (
    <>
      <Card>
        <Heading level={4}>Providers</Heading>
      </Card>
      <ProviderList providers={providers} />
      {providers.data && <ProvidersUsage providers={providers} />}
    </>
  );
};

export default Providers;
