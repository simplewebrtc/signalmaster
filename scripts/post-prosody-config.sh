#! /bin/shs

wget --header="Content-Type: application/yaml" --method="POST" --body-file="/app/cm-prosody-config.json" \
${KUBERNETES_RO_SERVICE_HOST}:${KUBERNETES_RO_SERVICE_PORT}/api/v1/namespaces/default/configmaps