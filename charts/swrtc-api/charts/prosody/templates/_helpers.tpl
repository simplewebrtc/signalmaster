{{/* vim: set filetype=mustache: */}}

{{/*
Expand the name of the chart.
*/}}
{{- define "prosody.name" -}}
{{- printf "%s-%s" ( default .Chart.Name .Values.nameOverride ) .Values.global.environment | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "prosody.fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "prosody.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "ports-service" -}}
ports:
{{- range .Values.deployment.ports }}
- port: {{ .containerPort }}
  protocol: TCP
  name: {{ .name }}
  {{- if .protocol }}
  protocol: {{ .protocol }}
  {{- else }}
  protocol: TCP
  {{- end }}
{{- end }}
{{- end -}}
