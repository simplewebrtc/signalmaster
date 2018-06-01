#! /bin/sh

# delete existing configmap

KUBE_TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)

wget -vO- --ca-certificate /var/run/secrets/kubernetes.io/serviceaccount/ca.crt  \
--header "Authorization: Bearer $KUBE_TOKEN" \
--method="DELETE" \
https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/api/v1/namespaces/default/configmaps/prosody-config-${ENV_LEVEL}

# create new configmap
wget -vO- --ca-certificate /var/run/secrets/kubernetes.io/serviceaccount/ca.crt  \
--header="Content-Type: application/yaml" \
--method="POST" --body-file="/app/cm-prosody-config.json" \
--header "Authorization: Bearer $KUBE_TOKEN" \
https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/api/v1/namespaces/default/configmaps
