---
title: "Datadog Tagging Best Practices"
date: 2026-03-12
tags:
  - datadog
  - tech
description: "Overview of Tags in Datadog
Introduction to Tags
As today’s infrastructure and applications grow more complex, dynamic, and ephemeral, questions arise about how to monitor and understand the behavior of these systems.
How can you build a coherent pic"
---

# Overview of Tags in Datadog

### Introduction to Tags

As today’s infrastructure and applications grow more complex, dynamic, and ephemeral, questions arise about how to monitor and understand the behavior of these systems.
- How can you build a coherent picture using all your metric, log, and trace data?
- How do you ensure that teams and stakeholders can find the data they need?
- How can you diagnose issues quickly and efficiently?

> Tags in Datadog enable you to tackle these challenges.

Tags are labels that can be attached to your data to add context, so that you can filter, group, and correlate your data throughout Datadog. Tags help you optimize your monitoring workflows, troubleshoot issues faster, and understand clearly how individual parts fit into the bigger picture of your system. In the image below, you can see the tags assigned to the metric data of a host displayed in the Host Map in Datadog. These tags allow you to search for the host in the Host Map and the metric data for the host in different products of the Datadog platform.
![image_1773129180656_0](http://127.0.0.1:47800/image/bafyreieeej5aie7lxetao2s6t7fhksodgconub6huuyzgjov5xtijtgjge)
In Datadog, each datapoint includes a name or identifier, a value, a timestamp, and the assigned tags. Tags can be either simple values or key-value pairs. In the example datapoint below, the tag `file-server` is a simple value and the tags `availability-zone:us-east-1a`, `hostname:foo`, and `instance-type:m3.xlarge` are key-value pairs.
![image_1773129196063_0](http://127.0.0.1:47800/image/bafyreifo7fksdaafit7duviy4ds26dxi2e7oyyiw4hxcxx7w2vlt7nr7wi)
When you query your data, you can filter and group the data based on the tag format. Simple value tags can only be used to filter datapoints, while key-value pair tags can be used to group datapoints as well as filter them. Each unique key adds a new dimension to the data. You can use specific key-value pairs to filter and group the data and individual keys to group the data.
| Tag Format | Examples | Can be used to filter, group? |
|:---------------|:--------------------------|:------------------------------------------------|
| Simple Value | `staging`, `demo` | Filter |
| Key-Value Pair | `env:staging`, `env:demo` | Filter - using `key:value`, Group - using `key` |

Because key:value pair tags provide the flexibility of filtering and grouping data, **key:value pair tags are recommended**. In the example below, the host map is filtered by the key-value tag `env:staging` and the simple value tag `active` and grouped by the key `availability-zone`.
![image_1773129280115_0](http://127.0.0.1:47800/image/bafyreid2wqdtdyabyakn3gqtn3xwesqwurjuwaqjlf2xg2wrmvbqltnn54)

### Reserved tags and Unified Service Tagging

In Datadog, there are “reserved” tag keys that are used to correlate metric, trace, and log data throughout Datadog. Correlating the data types in Datadog allows you to understand your infrastructure and applications at all levels and efficiently troubleshoot performance issues.
Reserved tag keys (listed below) should only be assigned for their defined purposes and should be used consistently wherever you use them. For example, assign the `service` tag to application services you are monitoring in Datadog Application Monitoring (APM) so that they appear in the [Software Catalog](https://docs.datadoghq.com/software_catalog/) and [Service Map](https://docs.datadoghq.com/tracing/services/services_map/), and have their own [Service Pages](https://docs.datadoghq.com/tracing/services/service_page/).
| Reserved Tag Key | Used for |
|:-----------------|:----------------------------------------------------------------------|
| host | Correlation between metrics, traces, processes, and logs |
| device | Segregation of metrics, traces, processes, and logs by device or disk |
| source | Span filtering and automated pipeline creation for Log Management |
| env | Scoping of application specific data across metrics, traces, and logs |
| service | Scoping of application specific data across metrics, traces, and logs |
| version | Scoping of application specific data across metrics, traces, and logs |
| team | Assign ownership to any resources |

The reserved keys `env`, `service`, and `version`, specifically, can be used together for Unified Service Tagging of containerized and non-containerized environments. For example, [Unified Service Tagging](https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging) allows you to scope data for an environment and service by deployment version so that you can observe the behavior of different deployments over time.
![image_1773129403947_0](http://127.0.0.1:47800/image/bafyreiherlrlqtaewx6hpn26fozlisy43ui6gwtjxkkgv64i7y2lc6ax7y)

### Assigning and using tags

You can assign tags to your data automatically using integration inheritance and manually using the methods described in the [Assigning Tags documentation](https://docs.datadoghq.com/getting_started/tagging/assigning_tags).
In Datadog, tags play an important role in your monitoring workflows. The [Using Tags documentation](https://docs.datadoghq.com/getting_started/tagging/using_tags) provides a comprehensive overview of using tags throughout Datadog. As Datadog adds new products to the platform, the tags you’ve assigned and the context they provide will automatically be available with no additional work on your part.
With many ways to assign and use tags, Datadog enables you to optimize your infrastructure and application monitoring workflows.
As you tag your infrastructure and applications, you should consider which types of tags you and your teams will need. In the next lesson, you’ll review the different use cases for tags.

---

### Examples of Tags

How you use tags in Datadog depends on your use cases and the data you’re monitoring, but there are some common tag categories that you can use to organize and filter your data.

### Native tags

With a Datadog [integration](https://docs.datadoghq.com/integrations/) for a service provider tool, tags, labels, or annotations that you configure in the tool can be inherited and automatically assigned to the collected data. This is called [integration inheritance](https://docs.datadoghq.com/getting_started/tagging/assigning_tags?tab=integrations#integration-inheritance). Check the service provider’s documentation to find out how to configure tags in a tool so that they can be inherited through the integration. You’ll also want to check the [integration](https://docs.datadoghq.com/integrations/) documentation to learn which data can be collected from a tool.
**Examples**: `region:xxx`, `availability-zone:xxx`, and `instance-type:xxx` are common native tags that can be inherited from cloud provider integrations.

### Scope tags

Scope tags can be used by engineers, SREs, and managers to group data based on technological organization.
**Examples**: `env:xxx` tags can separate data for distinct deployment environments. `datacenter:xxx` tags can be used to identify the specific data center of the data source. If a data center is down, you’ll be able to identify the data center and ensure customer service is maintained.

### Function tags

Function tags can be used by engineers, SREs, and other end users to track and monitor hosts and services based on any relevant use case.
**Examples**: `service:xxx`, `site:xxx`, `role:xxx`, `database:xxx`, `webserver:xxx`

### Ownership tags

Ownership tags allow you to search and track data according to the people and teams in your organization that are responsible. You can create dashboards for data that is relevant to a specific owner’s workflows and then search the data using the specific ownership tag. You can also set up a multi alert and tag it with the specific ownership tag to notify the right people when a host or service is down.
**Examples**: `team:xxx`, `owner:xxx`, `creator:xxx`

### Business role tags

Business role tags can be used by managers and finance teams for cost allocation and chargebacks of Datadog and other services used by internal departments, business units, and customers.
**Examples**: `business\_unit:xxx`, `cost\_center:xxx`

### Customer tags

Customer tags can be used by customer-facing business users and executives to keep track of customer usage and service level objectives.
**Examples**: `customer.region:xxx`, `customer.name:xxx`, `product.family:xxx`, `product.name:xxx`

### Monitor tags

Monitor tags can be used to denote which infrastructure and services you want to include when setting up integrations for certain services like cloud providers.
**Examples**: `monitor:true`, `datadog:true`
*With these examples in mind, can you think of some tags that are relevant to your use cases?*
Next, take a look at some recommended best practices for tagging.

---

### Suggested Best Practices and Considerations

Because you use tags to filter, group, and correlate your data throughout Datadog, the following best practices and considerations are recommended when you are assigning tags to your data.

## Identify your use cases

Which infrastructure and application environments will you be monitoring? If you are monitoring more than one environment, you will want to assign key:value pair tags so that you can filter and group data based on the environment. Assigning the reserved key tag `env` (along with the reserved key tags `service` and `version`) will allow you to take advantage of [Unified Service Tagging](https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging).
Which infrastructure and application services will you be monitoring? Tagging those services with reserved tags like `host` and `service` will make it easier for you to search and correlate data throughout Datadog.
What tags are native to your service provider tools? Are there related Datadog integrations that you can install for these tools? Because of integration inheritance in Datadog, the tags you configure in many of your service provider tools can be inherited with the data collected using integrations. For example, tags configured for `availability-zone` and `region` in cloud providers can be inherited through integrations so that they automatically show up in Datadog.
Which custom tags will add scope, function, and business dimensions to your data? Assigning these tags will allow you to filter, group, and correlate data using a more nuanced approach matched to your specific organization. For example, the scatter plot below visualizes container usage by service and team in an application environment.
![image_1773130030012_0](http://127.0.0.1:47800/image/bafyreighfkelnjqugb7j3kinshlxyb7m7ncc2mgi2ehmtptjyd7fuqmakq)

## Consider the end users of the data

Which infrastructure and services do teams, product areas, and business units own? Will you want to filter and group the data based on ownership?
Will teams want targeted alerts for data they are focused on?
Will managers or finance teams be using data for cost allocation purposes?
And, will business users be building dashboards related to domain-specific groupings, like customer usage? In the business-end-user dashboard below, the template variables at the top are the tag keys `customer`, `security\_group`, and `application`. You can select any value from each template variable menu to filter the data displayed in the dashboard.
![image_1773130050106_0](http://127.0.0.1:47800/image/bafyreihgi6yio7gzg6lno77kzfy5kleeaiangtrdey5fars5egdtafltky)

## Create an organization-wide tagging approach

Work with other teams to create standards for tag structures. You will want all teams to use the same variation of a tag so that all data with that tag is correlated.
The example below shows tags for the Metric Summary of the `system.cpu.user` metric. The boxed area indicates the tags `app`, `app\_name`, `application`, and `application\_name` are all listed for this metric. It’s not clear what the differences are among these tags. Some of these applications are application products, like `app\_name:coffee-house`, while others are supporting applications, like `app:docker`.
Using different variations of the word “application” without a clear designation for which tag key to use for which type of application can be confusing and won’t allow for `system.cpu.user` data to be searched across the different applications. An established naming convention would provide clarity and consistency for tags that relate to different aspects of “application.”
![image_1773130138928_0](http://127.0.0.1:47800/image/bafyreidyyjdom6jzwyk4mqg6zhiajbn2rk33vyghml6afz7cnisr23cccm)
It may be helpful to create a central repository or some other configuration management for tags, so that all teams know how to tag their data and which keys and values to use for filtering and grouping data. This approach has the advantage of ensuring that your tagging standards can be maintained and expanded over time.
With a little bit of planning, you can reduce noise, increase insights, and expand the value of your monitoring workflows to more parts of your organization.
In the following hands-on labs, you’ll work with two different environments, a containerized application deployed using Docker and a Kubernetes deployment. You’ll use the tags assigned to data from each environment to filter, group, and search their data in different products in Datadog.

---

# Lab: Tagging Use Cases

## Introduction

In this lab, you will use tags to interact with data from a fictional app called Storedog and work through the following tasks:
- Explore assigned tags for the application
- Examine application data in Datadog
- Create Synthetic tests for the Storedog home page and use tags to associate them with specific services
- Set up targeted alerts using tags to notify specific teams when a part of their workflow needs attention
- Compare the performance of an app service in a new version of the app using Unified Service Tagging

```
Your Datadog credentials for logging in to https://app.datadoghq.com are as follows:
Username:       1hb7pzim16@ddtraining.datadoghq.com
Password:       7ce915fC+8
API Key:        c8fd79d5b933650d2de139a5e5558fc3
Account expires in 12 days and 20 hours

This training account is a trial account that's available for 14 days. After the trial account expires, you will be automatically provisioned a new trial account that you can use to continue your learning. These credentials will only work for Datadog Learning Center labs.

======

If these lab credentials do not work, click the Help tab above this lab terminal for troubleshooting tips.

root@app-lab-host:~/lab#
```

## Working with tags and Unified Service Tagging

### 1. In the [lab IDE tab](https://play.instruqt.com/embed/datadog/tracks/tagging-best-practices/challenges/tagging-app-service/assignment#tab-1), open `docker-compose.yml` to view the file in the editor.

The `docker-compose.yml` instruments the Datadog Agent and application for monitoring with Datadog.
All configuration in a Docker environment is done through environment variables, volumes, and Docker labels.
Because the application is run in a Docker (containerized) environment, the Datadog Agent runs in a container alongside the application containers: `dd-agent`.
Each application service runs in its own Docker container: `frontend`, `backend`, `worker`, `ads-java`, `discounts`, `postgres`, `redis`, and `nginx`.
```
services:
dd-agent:
image: gcr.io/datadoghq/agent:7.56.0
environment:
- DD_API_KEY
- DD_HOSTNAME
- DD_TAGS="env:${DD_ENV}"
- DD_LOGS_ENABLED=true
- DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
- DD_PROCESS_AGENT_ENABLED=true
- DD_CONTAINER_LABELS_AS_TAGS={"my.custom.label.color":"color"}
- DD_APM_NON_LOCAL_TRAFFIC=true
- DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true
- DD_SYSTEM_PROBE_NETWORK_ENABLED=true
pid: "host"
ports:
- "8126:8126/tcp"
- "8125:8125/udp"
volumes:
- /var/run/docker.sock:/var/run/docker.sock:ro
- /proc/:/host/proc/:ro
- /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
- /var/lib/docker/containers:/var/lib/docker/containers:ro
- /sys/kernel/debug:/sys/kernel/debug
cap_add:
- SYS_ADMIN
- SYS_RESOURCE
- SYS_PTRACE
- NET_ADMIN
- NET_BROADCAST
- NET_RAW
- IPC_LOCK
- CHOWN
security_opt:
- apparmor:unconfined
labels:
com.datadoghq.ad.logs: '[{"source": "agent", "service": "agent"}]'
frontend:
image: public.ecr.aws/x2b9z2t7/storedog/frontend:1.2.4
command: bash -c "wait-for-it backend:4000 -- npm run build && npm run start"
volumes:
- .env:/storedog-app/.env.local
ports:
- "${FRONTEND_PORT-3000}:3000"
environment:
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_LOGS_INJECTION=true
- DD_SERVICE=store-frontend
- DD_VERSION=1.2.4
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
depends_on:
- dd-agent
- backend
labels:
com.datadoghq.ad.logs: '[{"source": "nodejs", "service": "store-frontend"}]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-frontend"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "red"
backend:
image: public.ecr.aws/x2b9z2t7/storedog/backend:1.2.4
command: wait-for-it postgres:5432 -- bundle exec rails s -b 0.0.0.0 -p 4000
depends_on:
- dd-agent
- postgres
- redis
ports:
- 4000:4000
environment:
- REDIS_URL
- POSTGRES_USER
- POSTGRES_PASSWORD
- DB_HOST=postgres
- DB_PORT=5432
- RAILS_ENV=development
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_SERVICE=store-backend
- DD_VERSION=1.2.4
- DD_LOGS_INJECTION=true
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
labels:
com.datadoghq.ad.logs: '[{"source": "ruby", "service": "store-backend", "auto_multi_line_detection":true }]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-backend"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "orange"
worker:
image: public.ecr.aws/x2b9z2t7/storedog/backend:1.2.4
command: wait-for-it postgres:5432 -- bundle exec sidekiq -C config/sidekiq.yml
depends_on:
- dd-agent
- postgres
- redis
volumes:
- /opt/datadog-training/storedog/services/worker/config/initializers/datadog-tracer.rb:/app/config/initializers/datadog-tracer.rb
environment:
- REDIS_URL
- DB_HOST=postgres
- DB_PORT=5432
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_SERVICE=store-worker
- DD_VERSION=1.2.4
- DD_LOGS_INJECTION=true
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
labels:
com.datadoghq.ad.logs: '[{"source": "ruby", "service": "store-worker"}]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-worker"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "yellow"
ads-java:
image: public.ecr.aws/x2b9z2t7/storedog/ads-java:1.2.4
environment:
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_SERVICE=store-ads-java
- DD_VERSION=1.2.4
- DD_LOGS_INJECTION=true
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
ports:
- "${ADS_PORT}:8080"
depends_on:
- dd-agent
labels:
com.datadoghq.ad.logs: '[{"source": "java", "service": "store-ads-java"}]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-ads-java"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "green"
discounts:
image: public.ecr.aws/x2b9z2t7/storedog/discounts:1.2.4
command: wait-for-it postgres:5432 -- ./my-wrapper-script.sh ${DISCOUNTS_PORT}
environment:
- FLASK_APP=discounts.py
- FLASK_DEBUG=1
- POSTGRES_PASSWORD
- POSTGRES_USER
- POSTGRES_HOST=postgres
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_SERVICE=store-discounts
- DD_VERSION=1.2.4
- DD_LOGS_INJECTION=true
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
ports:
- "${DISCOUNTS_PORT}:${DISCOUNTS_PORT}"
depends_on:
- dd-agent
- postgres
labels:
com.datadoghq.ad.logs: '[{"source": "python", "service": "store-discounts"}]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-discounts"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "blue"
volumes:
- /root/discounts.py:/app/discounts.py
postgres:
image: public.ecr.aws/x2b9z2t7/storedog/postgres:1.2.4
command: ["postgres", "-c", "config_file=/postgresql.conf"]
restart: always
environment:
- POSTGRES_PASSWORD
- POSTGRES_USER
- POSTGRES_HOST_AUTH_METHOD=trust
ports:
- "127.0.0.1:5432:5432"
depends_on:
- dd-agent
labels:
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "database"
com.datadoghq.tags.version: "13"
my.custom.label.color: "purple"
com.datadoghq.ad.check_names: '["postgres"]'
com.datadoghq.ad.init_configs: "[{}]"
com.datadoghq.ad.instances: '[{"host":"%%host%%", "port":5432, "username":"datadog", "password":"datadog"}]'
com.datadoghq.ad.logs: '[{"source": "postgresql", "service": "postgres"}]'
redis:
image: redis:6.2-alpine
volumes:
- redis:/data
depends_on:
- dd-agent
labels:
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "redis"
com.datadoghq.tags.version: "6.2"
my.custom.label.color: "purple"
com.datadoghq.ad.check_names: '["redisdb"]'
com.datadoghq.ad.init_configs: "[{}]"
com.datadoghq.ad.instances: '[{"host":"%%host%%", "port":6379}]'
com.datadoghq.ad.logs: '[{"source": "redis", "service": "redis"}]'
nginx:
image: public.ecr.aws/x2b9z2t7/storedog/nginx:1.2.4
restart: always
ports:
- "80:80"
depends_on:
- dd-agent
- frontend
labels:
com.datadog.tags.env: "${DD_ENV}"
com.datadog.tags.service: "store-nginx"
com.datadog.tags.version: "1.27.1"
com.datadog.tags.team: "backend"
com.datadoghq.ad.logs: '[{"source": "nginx", "service": "store-nginx"}]'
com.datadoghq.ad.check_names: '["nginx"]'
com.datadoghq.ad.init_configs: "[{}]"
com.datadoghq.ad.instances: '[{"nginx_status_url": "http://%%host%%:81/nginx_status/"}]'
puppeteer:
image: ghcr.io/puppeteer/puppeteer:20.9.0
volumes:
- /opt/datadog-training/storedog/services/puppeteer/puppeteer.js:/home/pptruser/puppeteer.js
- /opt/datadog-training/storedog/services/puppeteer/puppeteer.sh:/home/pptruser/puppeteer.sh
environment:
- STOREDOG_URL
- PUPPETEER_TIMEOUT
- SKIP_SESSION_CLOSE
command: bash puppeteer.sh
volumes:
redis:
```

### 2. Scroll through the file to view the configurations and tag assignments.

**Line 7** assigns the `env` tag to the host. By assigning this tag, all data coming in from the Storedog application is labeled as belonging to the same environment.
On **line 11**, the variable `DD\_CONTAINER\_LABELS\_AS\_TAGS` specifies that container labels should be collected and used as tags in Datadog.
Container labels, set in the `labels` block for each service, provide a way to include recommended and custom tags, including:
- `env`, `service`, and `version` tags for Unified Service Tagging
- `source` and `service` tags for logs, useful for searching and correlating logs with other data
- `team` tags that can be used to associate alerts with specific teams
- A custom `color` tag, which is mapped to Datadog from the custom container label `my.custom.label.color`

Datadog's Autodiscovery collects these labels and uses them as tags in Datadog. You can add your own custom labels to the `labels` block to tag your data as needed for your use cases.
The `environment` block for each service sets the `DD\_ENV`, `DD\_SERVICE`, and `DD\_VERSION` environment variables, which are necessary for Unified Service Tagging. For example, the `environment` block for the `frontend` service begins on **line 45**. Unified Service Tagging ties together Datadog telemetry using `env`, `service`, and `version` tags in Datadog. The values set for the `DD\_ENV`, `DD\_SERVICE`, and `DD\_VERSION` environment variables are used as the values for these three reserved tags.
Setting these environment variables and the corresponding Docker labels for each container ensures that all metric, trace, and log data collected from the container has these three tags and can be correlated in Datadog.

---

## Exploring correlated data using tags

In Datadog, you can search and jump between correlated metric, log, and trace data for Storedog using the assigned tags.

### 1. In a new browser window or tab, use the login credentials provided in the terminal to log in to the [Datadog account/organization](https://app.datadoghq.com/account/login) that was created for you for this lab.

![image_1773220132339_0](http://127.0.0.1:47800/image/bafyreiahfv6qvxuqy3aqvwrtytira7lou2pbqjpuhdqussqh3vtiialpz4)

> If the link opens a Datadog account you're already signed in to, sign out of that account and sign in to the trial account using the credentials in the terminal.

### 2. If you have previously used **Logs** in the Datadog organization you are working in, you can move on to the next step.

If you are working in a new Datadog organization, you have to enable **Logs** before you can continue. In the main menu, click on**[Logs](https://app.datadoghq.com/logs)**. Click**Get Started**, then click**Get Started** again on the modal that pops up. You should now be able to see the Log List.
![image_1773220162111_0](http://127.0.0.1:47800/image/bafyreiegeohrmg3kk6pnns3bjd4reeo4ou476hwucnppxyjduvthrnjsz4)

### 3. In Datadog's main menu, hover over **APM** and click**[Traces](https://app.datadoghq.com/apm/traces)** to view the list of traces that are coming in.

![image_1773220540847_0](http://127.0.0.1:47800/image/bafyreiadom7omorc4qy6e76m5qtlm3j67d6wz3r4bvpqondqbwxbq5e5pu)

### 4. In the search field above the list of traces, you can use tags to narrow the list to include only traces for the Storedog app, from the `store-ads` service, and for one resource only. Copy the following search query and paste it into the search field:

```
env:storedog-tagging service:store-ads-java resource_name:"GET /ads"
```
You can also select these Facets from the list on the left. When you select the facet, you will see the tag appear in the search field.
![image_1773220624257_0](http://127.0.0.1:47800/image/bafyreica3agl2tz4eobcocdivimt5tshdgwseb5utxrioepmigrsbtyg34)

### 5. Click any trace in the list to view its details.

![image_1773220659998_0](http://127.0.0.1:47800/image/bafyreigotkrvbxgt3qihckf4ihi3guyshuwpolcwzgjreapnjhqxtrxx4i)

### 6. Below the Flame Graph, click through the **Infrastructure**,**Metrics**, and**Processes** tabs to see the metric data that is correlated to the trace data using core tags like `env`, `host`, and `service`.

![image_1773220748288_0](http://127.0.0.1:47800/image/bafyreid3aa5n6ienujelg3s6o3qftedyio2w42eplg5rf6wbb4vda5xntm)
![image_1773220859432_0](http://127.0.0.1:47800/image/bafyreibuarrsd6ymfrp7s7kgcu74ncnh52acmu7o3kyp7fs2xr62xe64qq)
![image_1773220804844_0](http://127.0.0.1:47800/image/bafyreictjjkiiyywfe4rrfjhfkkch2m5s4yhswp3bdykej2a3obpy4tm24)

### 7. Below the Flame Graph, click the **Logs** tab to view the list of logs associated with this trace.

![image_1773221127222_0](http://127.0.0.1:47800/image/bafyreigpsmdgkqs4szhvvfhz7lcunui7lx5uktwm5pflmx3zey3pmuq5ay)
Notice the tag selected in the search field above the list of logs is the `trace\_id` for the specific trace. You can configure log collection to include `trace\_id` injection by Datadog. Resources to learn more about correlating logs and traces are included at the end of this course.

### 8. Click any of the logs. A new tab will open in **Logs** with the log details.

![image_1773221189139_0](http://127.0.0.1:47800/image/bafyreiap56ldyweh6u7wvsgc7d3e4krf7g7locgmuzsdrpv5upuoxwk47y)

### 9. Close the log details side panel and clear the search field in Logs to list all the logs.

![image_1773221238222_0](http://127.0.0.1:47800/image/bafyreigfzicosgiez7qagelkaavtdcemc2ikfggvormchd7s4kkypehnry)

### 10. In the Logs search field, enter the following search query:

```
env:storedog-tagging service:store-discounts
```
You will see a list of logs for the `store-discounts` service in the Storedog app.
![image_1773221303482_0](http://127.0.0.1:47800/image/bafyreic6d2koyczzuqaitjvczrqwzx52fucva6hjdkly6vse5yrinob23a)

### 11. Click any log in the list to view its details.

![image_1773221391510_0](http://127.0.0.1:47800/image/bafyreicjyxojvgrkgoiiucsl7ulbuxtnlv2pnb2y554p6nsfhkuayhw7pe)

### 12. Click on **+22** to expand the alphabetical list of tags and reveal the option to filter tags. *Note: you may see a different number next to the + sign, depending on the number of tags this log has.*

![image_1773221463461_0](http://127.0.0.1:47800/image/bafyreiedxyvotbdcb63zizrfzcceaebjsmlojcsg4e5rvv545qdqpsckxm)

### 13. Search for the `color` tag. Notice that this tag has the value `blue`, which matches the label that is set in the docker-compose file. In the [lab IDE tab](https://play.instruqt.com/embed/datadog/tracks/tagging-best-practices/challenges/tagging-app-service/assignment#tab-1), look at `docker-compose.yml`. On **line 163** you will see that the `my.custom.label.color: blue` is assigned to the `store-discounts` service.

![image_1773221506743_0](http://127.0.0.1:47800/image/bafyreidpscw33bj2dli5ekcvlno4fwrot6cm5a2jtxzbpegt7f7hikq2hy)

### 14. Near the top of the log details, click **Service** and then select**Go to APM Service Page**. The service page associated with the trace log will open in a new tab.

![image_1773221544876_0](http://127.0.0.1:47800/image/bafyreibnmsauyyiy2afpgfumdvxi5aeghlqwzv7kdhy5gtijwqfwiouro4)
Navigating smoothly from traces to metrics, logs, and service pages is possible because of tags like `env`, `host`, `service`, and `trace\_id` that connect your data in Datadog and allow you to find what you need efficiently.
![image_1773221585728_0](http://127.0.0.1:47800/image/bafyreialoiidy3qv5vpdpb2m2nd5viurusohvk6yb4dapcmvt2fxzfze6u)

---

---

## Searching and correlating Synthetic tests using tags

Tags can serve as *facets* for many features throughout Datadog, providing a fine-grained way to filter, search, and analyze data. To explore the capabilities of tags as facets, you'll create Synthetic tests for the Storedog home page, use tags to associate them to specific services, and then use tags as facets to search for the tests you created.

### 1. In Datadog, hover over **Digital Experience**. Under**Synthetic Monitoring & Testing**, click**New Test**.

![image_1773283954991_0](http://127.0.0.1:47800/image/bafyreigxvgtdtnruevcwqg2iduf5q2q6tmwg2i4v7bxbobh4c6hi5wabte)

### 2. Click **API Test**.

![image_1773284024904_0](http://127.0.0.1:47800/image/bafyreidvmo7chfnpdo4wqzhtbfyey2k5vaa7hw2je6fly4fzvt2tyi63ja)

### 3. Click **Start from Scratch**.

![image_1773284145049_0](http://127.0.0.1:47800/image/bafyreih3r3izapfviq7nv5tkwumqmp4znovh4heqn6yb6rw5l5ubjcbara)

### 5. Under **Define request**, fill in each field as directed below.

For **URL**, enter the custom URL of your Storedog home page.
```
https://app-lab-host-80-jbospqxaqehj.env.play.instruqt.com
```
In the **Name** field, enter the following:
```
Test on Storedog homepage
```
In the **Environment** field, enter the `env` tag:
```
frontend
```
When the **Create Team** modal opens, click**Create** to add the Team in Datadog.
In the **Additional Tags** field, add the `service` tag:
```
service:store-frontend
```
Your request definition should look similar to the image below.

> Your URL will be different from the one in the image below.

![image_1773284448680_0](http://127.0.0.1:47800/image/bafyreifo2aujxkwoh6qulxvz2gtlpiqiiastz6ovibbs44wigw3mn6xfyq)

### 6. Expand **Assertions**. Click**New Assertion** and fill in the fields as follows:

- **When** `response time` `including DNS` `is less than` `10` ms
![image_1773284511407_0](http://127.0.0.1:47800/image/bafyreihivxhqeeulh2xmom6bwg3xaa6fr3f6z6grazmdrjntzbvveqfrbm)

### 7.  Expand **Locations**. Deselect**All Locations** and check the box for `Americas`, as shown below.

![image_1773284560971_0](http://127.0.0.1:47800/image/bafyreib2tquulwrtg46vxez4ye4u6olyhfxmpxbmgv5lyuj2y4wo6gxkvu)

### 8. Skip **Retry conditions**.

### 9. Expand **Scheduling and alert conditions** and fill in each field as follows:

An alert is triggered if your test fails for `1` minute from any **`1` of 11 locations.**
![image_1773284754073_0](http://127.0.0.1:47800/image/bafyreiha636f5jyjeqfbpkg7zkn3tm4gkyqhwh5qwkzusenpowpflipi4m)

### 10. Expand the **Monitor** section. You can leave this section blank, or you can enter a message and select to receive notifications.

![image_1773284812602_0](http://127.0.0.1:47800/image/bafyreibtk2idbjpcrzwnbbhulv3scn3po54tt6tbzkwgkg4qg2spaf7uly)

### 11. Skip **Permissions**.

### 12. Click **Save Test**. You will be redirected to the new Synthetic test.

Near the top of the page, you will see a message that you may need to refresh the page in a moment after data starts coming in. This is expected.
![image_1773284898237_0](http://127.0.0.1:47800/image/bafyreidgka3u4yy47esdplkr5fjiqtlgpjoi6g5fnistjhvji5arsjlsfa)
Under **Properties**, notice that the values for the tags you assigned to the test for `team`, `env`, and `service` are listed under**TEAM**,**ENVIRONMENT**, and**ADDITIONAL TAGS**.

### 13. Near the top left corner, click the icon for **Synthetics** to navigate to the test list. Alternately, you can hover over**Digital Experience** in the menu on the left and navigate to**[Synthetic Monitoring & Testing > Tests](https://app.datadoghq.com/synthetics/tests)**.

![image_1773285509857_0](http://127.0.0.1:47800/image/bafyreigh6nyrwbo4jucgx3e5vqwgset3kzor235f43xol6dia6dzglw65u)

### 14. In the facets list on the left, expand the **TAGS** facet. You will see a menu for**service**. Click this menu to expand it. This menu was created because you assigned the `service` tag to the Synthetic test.

![image_1773285750945_0](http://127.0.0.1:47800/image/bafyreiat633v6tdcqjewyn6xvayctyd4u5ryjzvmeqfcxewiznrfciwfgm)

### 15. In the search field above the list of facets, enter:

```
tag:"service:store-frontend"
```
![image_1773285781543_0](http://127.0.0.1:47800/image/bafyreicoektmg37yllqqvjy6btccu6llqxyeszs345kd2ionkthre32qgi)
With this tag as a search term, you can still see the test you created in the list, with the tag you searched for highlighted.

### 16. On your test, click the three dots icon to open a context menu.

### 17. In the menu, click **Clone**.

![image_1773285840264_0](http://127.0.0.1:47800/image/bafyreiefbwwtix6ctpmdxk5awpgrqigz4h7wrnj5tshyzzei6xioblzlhm)

### 18. In your new test, make the following changes:

a. Under **Define request**, name the new test `Test on Storedog homepage 2`
```
Test on Storedog homepage 2
```
b. Remove the `service:store-frontend` tag.
![image_1773285946867_0](http://127.0.0.1:47800/image/bafyreib7gcmcyp47tlfrsqmuft5d45oe4piruh27guca2tluauxeive2cm)

### 19. Click **Save Test**.

### 20. Navigate to the Synthetics list and view the **Env** and**TAGS** facets. You may need to refresh the page after a few moments to see the new test.

Notice that there are 2 tests for `env:storedog-tagging` and `team:frontend`, but only 1 test for `service:store-frontend`.
![image_1773286264559_0](http://127.0.0.1:47800/image/bafyreifrdepuidi72gtbsg3slfellp2yjrreittbp3huhnqaibpkrzqazu)

### 21. In the search field above the list of facets, enter `tag:"service:store-frontend"`. Only the `Test on Storedog Home Page` test appears in the list.

```
tag:"service:store-frontend"
```
![image_1773286310609_0](http://127.0.0.1:47800/image/bafyreidch43yliphssqym2swx6cds25oqyyswaghkirypspek3frwhl7va)
Assigning relevant tags ensures that you can find all tests associated with each tag and connects your tests to related data throughout Datadog.

### 22. Navigate to **[APM > Software Catalog > Services](https://app.datadoghq.com/software)** and hover over**store-frontend**. Click the**Service Page** button to see the full page for the service.

![image_1773286630873_0](http://127.0.0.1:47800/image/bafyreig2476amnpc3paxr7vtmnoadh32qyf5k3ufdic6fogfobeogjdzsu)
![image_1773286648546_0](http://127.0.0.1:47800/image/bafyreic2i5tekzjw2fsjcepc5qt7iioiee3qtxefl3hcqha5vtifzxn3bm)

> On the Service Page, check that you have the env:storedog-tagging tag selected in the env dropdown menu.

### 23. Above the **Service Summary**, click the**ALERT: 1 Synthetic Test** banner.

### 24. In the side panel, scroll to **Synthetic Tests**.

All monitors and Synthetic tests that have the `env:storedog-tagging` and `service:store-frontend` tags are listed.
![image_1773286737309_0](http://127.0.0.1:47800/image/bafyreibuny2p3lg7i7amqtcni7a5tkhdwmggxk6av4iro4gdiaqutai2ae)
Notice that only the first Synthetic test you created is listed under **Synthetics Tests** because it was assigned the `service:store-frontend` tag.
In general, all monitor or Synthetic tests that have tags for a specific `env` and `service` will be linked to the corresponding APM Service page. Similarly, all monitors and Synthetic tests that have tags for a specific `env`, `service`, and `resource\_name` will be linked to the corresponding APM Service and Resource pages.

### 25. Navigate to **[Digital Experience > Synthetic Monitoring & Testing > Tests](https://app.datadoghq.com/synthetics/tests)**. Select the tests you created and delete them. (This is to avoid unnecessary pings to the lab environment after you complete the lab.)

![image_1773286812516_0](http://127.0.0.1:47800/image/bafyreifqa2y4lrqostbe6gllx2zedg4xycwfqaeoadfsqrfcrsmxrplz7a)

---

# Creating tagerted alerts using tags

With the help of tags, you can create targeted alerts so specific teams or team members can be notified if anything in their workflow needs attention, as well as understand the relative priority of alerts on their watch.
Tagging alerts with the right metadata ensures that only the relevant team members are notified and can immediately triage the situation. Minimizing unnecessary notifications helps prevent alert fatigue, improving your team's well-being and the effectiveness of your monitoring response.
In this section, you will create a monitor for container CPU usage and set up targeted alerts using tags to notify the appropriate team.

## Create a monitor for container CPU usage

### 1. In Datadog, navigate to **[Monitoring > Monitoring > New Monitor](https://app.datadoghq.com/monitors#/create)** to start creating a new monitor to track container CPU usage.

### 2. Select **Metric** from the list of monitors.

![image_1773287282337_0](http://127.0.0.1:47800/image/bafyreiaw5mo63ntzgsfxpsbanvhwc3e36n57ien643vv4iblhmwccjtrjm)

### 3. In **Choose the detection method**, select**Threshold Alert**.

![image_1773287319668_0](http://127.0.0.1:47800/image/bafyreie2bsswan6u233hdxrmm5o23nm4muzakespnfbbkoabsxslmy64je)

### 4. Expand **Define the metric**.

In field **a**, type and select:
```
docker.cpu.usage
```
For **from**, select `env:storedog-tagging` to filter by the app environment.
For **avg by** select `service` and `color`.
![image_1773287409803_0](http://127.0.0.1:47800/image/bafyreicl6wngg7ibvipgtsziefzqcvgygafnoz4izuyys5r5tqnnth5suu)

### 5. Expand **Set alert conditions**.

For **Alert threshold**, enter 20.
Leave all other fields as they are.
![image_1773287512710_0](http://127.0.0.1:47800/image/bafyreib5fstmnrdscfecd63sxt7uuvflutpppwgmf3qped24dttq3uhuka)

### 6. Expand **Configure notifications & automations**

In the **Example Monitor Name** field, enter the following message text:
```
The {{service.name}} service container {{color.name}} has high CPU usage!!
```
In **Example Monitor Message**, enter:
```
The {{service.name}} service container {{color.name}} has high CPU usage!!

Contact:
Email - @{{service.name}}@mycompany.com, @<YOUR EMAIL ADDRESS>
Slack - @slack-{{service.name}}
```
Assume that, at Storedog, the email addresses and Slack channels for engineering teams are named for their respective services. If any of the services triggers an alert, `{{service.name}}` and `{{color.name}}` will be populated with the appropriate values and those teams will be notified.
![image_1773287625152_0](http://127.0.0.1:47800/image/bafyreiedestwofzsbaywlwpitilmypqk2bsjn2ckeuku2gtlgr6s6ryt2u)
In a later step, you will send a test notification with the `{{service.name}}` and `{{color.name}}` populated. If you would like to receive the notification, replace `<YOUR EMAIL ADDRESS>` in the monitor message with your own email address. Make sure to leave `@` in front of your email address. If you do not want to enter your email address, that's fine. A screenshot of an example test notification is included below.
Under **Metadata**, in the**Tags** field, enter the following tag:
```
env:storedog-tagging
```

> To correlate a monitor with the associated services and teams, you must add tags to it manually.

Under **Aggregation**, select `Multi Alert`.
![image_1773287703863_0](http://127.0.0.1:47800/image/bafyreieehswphwhvp3eb2axtfbthy4lkdbhre4l7xzg36lgdibsxnik2gm)
Skip **Define permissions and audit notifications**.

### 7. Before you save the monitor, you can test the alert to see what a notification will look like.

In the bottom right, click **Test Notifications**.
In the pop-up window that appears, select the **Alert** tile and click**Run Test**.
A message appears in the window: `Test notifications sent with group color:<color.name>, service:<service.name>`.
![image_1773287746024_0](http://127.0.0.1:47800/image/bafyreifreg764ewbwg7jzbf5m56j4kn2xm2jph5xqumzkc6mgkanuxj57i)
If you entered your email address in the previous step, check your email account for an email with the subject `Triggered: [TEST] The <service.name> container <color.name> has high CPU usage!!`.
Open the email to view its details. You will see that the template variables for `{{service.name}}` and `{{color.name}}` have been replaced with the actual values throughout the email.
![image_1773287914258_0](http://127.0.0.1:47800/image/bafyreihabu4lqag55s65bkmhyce7nz55uhe4yktelzibluvm4ha6go2xaa)

### 8. In Datadog, close the **Test notifications for this monitor** window.

### 9. Delete your email address from the **Monitor Message** field if you added it in**Configure notifications & automations**.

### 10. Click **Create and Publish** to save the monitor.

## View monitor status in Software Catalog

### 1. View monitor status in Software Catalog

In the **Monitors** column, monitors that have been triggered for any service are listed in green or red, depending on their status.

> You may have to scroll to the right to see the monitors column.

![image_1773288369061_0](http://127.0.0.1:47800/image/bafyreiau2osjmvkkwuzux7otprqvc5hn66qoifkd2aewdj7bjr4pefhq74)

### 2. The **store-backend** service has 1 alert. Hover over the row for**store-backend** and click**Service Page**.

> If you don't see any triggered alerts, wait a few minutes and refresh the page. Make sure that Software Catalog is filtered with env:storedog-tagging or env:*.

![image_1773288417272_0](http://127.0.0.1:47800/image/bafyreihd2yostus5fcq7wtnfr3fqu462o43k2v5bvcbwqjptwbqwewtzxy)

### 3. Above the Service Summary graphs, you will see a **Monitor** banner. Click the banner to view the list of monitors associated with and suggested for the service.

![image_1773288477623_0](http://127.0.0.1:47800/image/bafyreidv4xdqycjd4zvno5svjbreve66mxeaiqkfburqbl2wrgtomlv5lq)

> If you aren't seeing a list of monitors, check that env:storedog-tagging is selected in the env dropdown menu at the top left under the service name.

![image_1773288519282_0](http://127.0.0.1:47800/image/bafyreidh7sgrfxlk6hbv5l42ygraur4oqacok65vjtx5upv45ee65ngk2m)
Notice that the monitor you created is listed here, tagged with `env:storedog-tagging`.

### 4. Navigate to **[Monitoring > Event Management > All Events](https://app.datadoghq.com/event/explorer)**, and search for the reserved tag `source:alert`. You will see the alert event that was triggered by the monitor you created.

```
source:alert
```
![image_1773288628045_0](http://127.0.0.1:47800/image/bafyreie67btypesmra6yeqbarzmk5eqimxbfxdvoped324yhds4544kqza)

### 5. Navigate back to **[Monitoring > Monitors > Monitor List](https://app.datadoghq.com/monitors/manage)**. Expand the**Custom Monitors** section. Select the**The {{service.name}} service container {{color.name}} has high CPU usage!!** monitor you created. Click the delete button at the top of the list, which will prevent unnecessary alerts after you complete the lab.

---

## Using tags to compare deployment versions

When you reviewed the docker-compose file for the app, you looked at the environment variables and Docker labels that assigned the `env`, `service`, and `version` tags. These tags are reserved for Unified Service Tagging in Datadog, a standard configuration that automatically links different types of data across your infrastructure, allowing you to investigate and monitor application data throughout Datadog. To view these tags in action, you can compare the performance of the app services in a new version of the app that you will bring up.

### 1. First, take down the previous version of the application using the following command in [the terminal](https://play.instruqt.com/embed/datadog/tracks/tagging-best-practices/challenges/tagging-app-service/assignment#tab-0):

```
docker compose -f docker-compose.yml down
```
![image_1773288832732_0](http://127.0.0.1:47800/image/bafyreihkfwkqwhdjclstnwbckuzn5t6s6hkrg4nwzm6fisxxzinrnjvomm)
Then bring up the new version of the application using the following command:
```
docker compose -f docker-compose-new.yml up -d
```
![image_1773288886947_0](http://127.0.0.1:47800/image/bafyreigcoxpt4ktfgflkguvc5zw5jkjzah733mtuxutz5bemymlwjx7iku)

### 2. In the [lab IDE tab](https://play.instruqt.com/embed/datadog/tracks/tagging-best-practices/challenges/tagging-app-service/assignment#tab-1), open `docker-compose.yml` to examine the docker-compose file for the original version of the app.

![image_1773289304775_0](http://127.0.0.1:47800/image/bafyreifxbpb3rpzjhwjhlskhqqizrnkqhyl5mmk4dbrfmn42crpioxdahq)

### 3. Next, open `docker-compose-new.yml` to examine the docker-compose file for the new version of the app.

![image_1773289275173_0](http://127.0.0.1:47800/image/bafyreids7n2idg3lxiji6w6guol4uykfhg6ikyx6rszhsnyiomedjj7zvm)

### 4. Compare the entries for `discounts-service` in each file.

The version number (in the `environment` block and container labels) is different: the minor version has been incremented from `1.2.4` in the `docker-compose.yml` file to `1.3.0` in the new `docker-compose-new.yml` file.

### 5. When the services are up and running in the [Terminal tab](https://play.instruqt.com/embed/datadog/tracks/tagging-best-practices/challenges/tagging-app-service/assignment#tab-0), navigate to **[APM > Software Catalog](https://app.datadoghq.com/software)**, hover over**store-discounts**, and select**Service Page**.

### 6. Change the time frame selector at the top to `Past 15 Minutes`.

![image_1773289399779_0](http://127.0.0.1:47800/image/bafyreif5lp2hp5afxop7s6cb4kid3bj3bfir3vi5zbedv7mkfphrvl6bye)

### 7. Click **Deployments** on the left to see deployment data for the `store-discounts` service. Notice that the two deployments for the service are listed: `1.2.4` and `1.3.0`.

> If you don't see the 1.2.4 and 1.3.0 deployments, wait a few minutes and refresh the page.

![image_1773289450456_0](http://127.0.0.1:47800/image/bafyreidr3yabpwwqf5sqsj6tqmrb67jhnd4t62bn6fknql2xr5ukhb2gmi)
Looks like the *`store-discounts` service had a high-latency issue that is resolved in the new version.*

### 8. Scroll back up to the **Service Summary** at the top of the page, which includes out-of-the-box graphs for crucial information like error count, latency, and average time per request. With the help of version tags, you can visualize the latency difference between the two versions of the service.

### 9. Click the title of the **Latency** graph to bring up a menu of alternate graph options. Select**Latency by Version**.

![image_1773289530065_0](http://127.0.0.1:47800/image/bafyreigdq3k5rt35q4gmpdidtxfiv4d3u6ctbrfcojv6hswk7nq6p7r77y)
The graph shows that the latency for the `store-discounts` service has improved significantly in the new version of the service.

Unified Service Tagging makes it possible to compare performance metrics across different versions of services in your environments.
Using the core tags `env`, `service`, and `version` across your infrastructure provides smooth and efficient navigation through traces, metrics, and logs when you're trying to locate the source of a problem or verify the impact of a change.

---

## Activity Summary

Throughout this activity, you did the following:
1. Explored correlated metric, trace, and log data for an application
2. Created targeted alerts and Synthetic tests that were linked to the associated app services
3. Used tags that you assigned to assets in Datadog, such as monitors and Synthetic tests, to search for those assets
4. Used Unified Service Tagging to monitor app services based on deployment version

---

# Tagging a Kubernetes Cluster Lab

(continuing…)

---

# Summary

Tags are labels that you assign to your data to add context for searching and correlating different data types throughout Datadog.
Tagging is a powerful tool that helps you optimize your infrastructure and application monitoring workflows. In addition to native tags assigned automatically through integration inheritance, you can assign custom tags to add scope, function, ownership, business, and customer dimensions to your data. When you choose and assign tags, it’s important to consider your use cases and end users. Working across teams at your organization to develop an organization-wide tagging approach avoids confusion, ensures that all data with a specific tag is correlated, and allows you to get the most out of Datadog.
