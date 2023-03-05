import { QRCodeSVG } from "qrcode.react";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Box,
  colors,
  font,
  Form,
  FormTextInput,
  Icon,
  spacing,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "triangle-ui";

import api from "../utils/api";
import Button from "../components/Button";
import format from "../utils/format";
import { Card, CardContainer, CardContent } from "../components/Card";
import TableLinkCell from "../components/TableLinkCell";
import { Modal } from "../components/Modal";
import { Text } from "../components/Text";

Chart.register(CategoryScale);

const ProviderOverview = ({ provider }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const delete_ = useMutation<unknown, unknown, any>(
    () => api(`/v1/providers/${provider.id}`, { body: {}, method: "DELETE" }),
    {
      onError: (error: any) => window.alert(error.message),
      onSuccess: () => {
        queryClient.invalidateQueries(["providers", provider.id]);
        navigate("/providers");
      },
    }
  );
  const update = useMutation<unknown, unknown, any>(
    ({ weight }) => api(`/v1/providers/${provider.id}`, { body: { weight }, method: "PATCH" }),
    {
      onError: (error: any) => window.alert(error.message),
      onSuccess: (data) => {
        queryClient.setQueryData(["providers", provider.id], data);
        setIsOpen(false);
      },
    }
  );

  return (
    <>
      <Modal isOpen={isDeleteOpen} onRequestClose={() => setIsDeleteOpen(false)}>
        <CardContainer>
          <CardContent>
            <Text weight="bold">Delete API key</Text>
          </CardContent>
          <CardContent>
            Are you sure you want to delete <b>{provider.id}</b>?
          </CardContent>
          <CardContent>
            <Box flex={{ justifyContent: "space-between" }}>
              <div />
              <Box>
                <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                <Button color="red" disabled={delete_.isLoading} onClick={() => delete_.mutate({})}>
                  Delete
                </Button>
              </Box>
            </Box>
          </CardContent>
        </CardContainer>
      </Modal>
      <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
        <Form
          initialValues={{ weight: provider.weight }}
          onSubmit={(values: any) => update.mutate(values)}
        >
          <CardContainer>
            <CardContent>
              <Text weight="bold">Edit Provider</Text>
            </CardContent>
            <CardContent>
              <FormTextInput autoFocus label="Weight" name="weight" width="100%" />
            </CardContent>
            <CardContent>
              <Box flex={{ justifyContent: "space-between" }}>
                <div />
                <Box>
                  <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button color="blue" disabled={update.isLoading} submit>
                    Save
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </CardContainer>
        </Form>
      </Modal>
      <CardContainer>
        <CardContent>
          <Box flex={{ justifyContent: "space-between" }}>
            <Text size="small">
              <Box flex={{ alignItems: "center" }}>
                <Icon icon="send" style={{ marginRight: spacing.small }} />
                {provider.object.toUpperCase()}
              </Box>
            </Text>
            <Text family="mono" size="small">
              {provider.id}
            </Text>
          </Box>
        </CardContent>
        <CardContent>
          <Box flex={{ alignItems: "center", justifyContent: "space-between" }}>
            <Text size="large" weight="bold">
              {provider.provider_label}
            </Text>
            <div>
              <Button onClick={() => setIsOpen(true)}>Edit</Button>
              {/* @ts-ignore */}
              {/* <Button disabled style={{ color: colors.yellow }}>
                Disable
              </Button> */}
              {/* @ts-ignore */}
              <Button onClick={() => setIsDeleteOpen(true)} style={{ color: colors.red }}>
                Delete
              </Button>
            </div>
          </Box>
        </CardContent>
        <CardContent>
          <Box flex={{}}>
            <Box padding={{ right: spacing.xlarge }}>
              <Text color="black400" size="small">
                Status
              </Text>
              <Box margin={{ top: spacing.small }}>Enabled</Box>
            </Box>
            <Box
              padding={{ horizontal: spacing.xlarge }}
              style={{ borderLeft: `1px solid ${colors.gray100}` }}
            >
              <Text color="black400" size="small">
                Date
              </Text>
              <Box margin={{ top: spacing.small }}>{format.timestamp(provider.created_at)}</Box>
            </Box>
            <Box
              padding={{ horizontal: spacing.xlarge }}
              style={{ borderLeft: `1px solid ${colors.gray100}` }}
            >
              <Text color="black400" size="small">
                Provider URL
              </Text>
              <Box margin={{ top: spacing.small }}>{provider.provider_url}</Box>
            </Box>
          </Box>
        </CardContent>
      </CardContainer>
    </>
  );
};

const ProviderUsage = ({ provider }: any) => {
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
            labels: provider.metrics.map((metric: any) => metric.timestamp),
            datasets: [
              {
                label: "eth_getBlock",
                data: provider.metrics.map((metric: any) => metric.latency),
              },
            ],
          }}
          width={600}
          height={300}
        />
      </CardContent>
    </CardContainer>
  );
};

const ProviderLogsEmpty = ({ provider }: any) => (
  <CardContent>
    <Box flex={{ alignItems: "center", justifyContent: "center" }} height="128px">
      <Text>
        You don't have any logs from <Text weight="bold">{provider.id}</Text>.
      </Text>
    </Box>
  </CardContent>
);

const ProviderLogsError = ({ error }: any) => (
  <CardContent>
    <Box flex={{ alignItems: "center", justifyContent: "center" }} height="128px">
      <Text>Error: {error.message}</Text>
    </Box>
  </CardContent>
);

const ProviderLogsLoading = () => (
  <CardContent>
    <Box flex={{ alignItems: "center", justifyContent: "center" }} height="128px">
      <Text>Loading...</Text>
    </Box>
  </CardContent>
);

const ProviderLogsTable = ({ logs }: any) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderCell align="left">Method</TableHeaderCell>
        <TableHeaderCell align="left">Latency</TableHeaderCell>
        <TableHeaderCell align="left">Status</TableHeaderCell>
        <TableHeaderCell align="left" minimized>
          Date
        </TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {logs.map((l: any) => (
        <TableRow key={l.id}>
          <TableLinkCell to={`/logs/${l.id}`}>{l.methodName}</TableLinkCell>
          <TableLinkCell tabIndex="-1" to={`/logs/${l.id}`}>
            {l.latency}
          </TableLinkCell>
          <TableLinkCell tabIndex="-1" to={`/logs/${l.id}`}>
            {l.request_status}
          </TableLinkCell>
          <TableLinkCell tabIndex="-1" title={l.timestamp} to={`/logs/${l.id}`}>
            {format.timestamp(l.timestamp)}
          </TableLinkCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const ProviderLogs = ({ provider }: any) => {
  const logs = provider.metrics;

  return (
    <CardContainer>
      <CardContent>
        <Box flex={{ alignItems: "center", justifyContent: "space-between" }}>
          <Text size="medium" weight="medium">
            Logs
          </Text>
        </Box>
      </CardContent>
      {logs.isLoading ? (
        <ProviderLogsLoading />
      ) : logs.error ? (
        <ProviderLogsError error={logs.error} />
      ) : logs.length ? (
        <ProviderLogsTable logs={logs} />
      ) : (
        <ProviderLogsEmpty provider={provider} />
      )}
      <CardContent>...</CardContent>
    </CardContainer>
  );
};

const Provider = () => {
  const params = useParams();
  const id = params.id!;

  const provider: any = useQuery(["providers", id], () => api(`/v1/providers/${id}`));
  console.log(provider);

  if (provider.isLoading) {
    return (
      <Card>
        <Box flex={{ justifyContent: "center" }}>Loading...</Box>
      </Card>
    );
  } else if (provider.error) {
    return (
      <Card>
        <Box flex={{ justifyContent: "center" }}>Error: {provider.error.message}</Box>
      </Card>
    );
  }

  return (
    <>
      <ProviderOverview provider={provider.data} />
      <ProviderUsage provider={provider.data} />
      <ProviderLogs provider={provider.data} />
    </>
  );
};

export default Provider;
