---
title: "Datadog Quick Start"
date: 2026-03-12
tags:
  - tech
  - datadog
description: "Introduction
Assume your company has an e-commerce app called Storedog. The app is
deployed on Docker and is made up of a few microservices including
store-frontend, store-backend, store-discounts, and store-ads. Your
company recently started using D"
---

# Introduction

Assume your company has an e-commerce app called Storedog. The app is
deployed on Docker and is made up of a few microservices including
store-frontend, store-backend, store-discounts, and store-ads. Your
company recently started using Datadog to monitor Storedog's health and
performance.
You just joined the team that manages the store-discounts service,
and you want to start working with the data asap. This quick hands-on
lab will help you get started. You'll learn different ways to navigate
Datadog to do the following:
1. Explore dashboards from Dashboards List
2. Search and visualize log data in Logs
3. Find application service details in Software Catalog
4. Interpret a monitor in Manage Monitors

In Datadog, you'll see that all the data from your systems have tags. Tags are simple `key:value`
pairs that provide metadata about your data. You can search, filter,
and group your data using tags. Datadog correlates data that has the
same tags across the platform. You can also assign tags to monitors and
other assets that you create in Datadog. The image below shows the list
of tags for a metric in Datadog. (You can click the image to enlarge
it.)
![image_1773045256544_0](http://127.0.0.1:47800/image/bafyreiflscwzanuzt3g5jnd3hxendw5qjlljjvxei5q7mfjzqld7kh6id4)
In this lab, the data from Storedog has the tag `env:quickstart-course`
to indicate that this data is from the quickstart-course environment.
Data that is specifically from the store-discounts service also has the
tag `service:store-discounts`. Both of these tags are listed
in the example image above. You'll use these tags as you search for data
and monitors in the lab.
```
Your Datadog credentials for logging in to https://app.datadoghq.com are as follows:
Username:       ebo44cutuv@ddtraining.datadoghq.com
Password:       4dDe327f+8
API Key:        87ac4b6c3db50ebc95a4ee230fae29bb
Account expires in 13 days and 20 hours

This training account is a trial account that's available for 14 days. After the trial account expires, you will be automatically provisioned a new trial account that you can use to continue your learning. These credentials will only work for Datadog Learning Center labs.

======

If these lab credentials do not work, click the Help tab above this lab terminal for troubleshooting tips.

root@lab-host:~/lab#
```

# Log in to Datadog

A Datadog trial account has been created and assigned to you for this
lab. The credentials for the account are displayed in the terminal next
to these instructions.
In a new browser tab, go to [https://app.datadoghq.com/account/login](https://app.datadoghq.com/account/login) and use the credentials in the terminal to log in to the Datadog trial account.

> Note: If you're unable to log in to Datadog with these credentials, click the Help tab above the terminal for instructions on how to get new credentials.

Once you're logged in to Datadog, click the **Explore a dashboard** heading below.

> Note: As you navigate the Datadog UI, some pages may have a large gradient image at the top containing some overview information about the page.You can close these images by clicking the X in the top right corner.

![image_1773045391508_0](http://127.0.0.1:47800/image/bafyreia6j7hqusqkqq2auejmr3hm2lu5plt6e2ay3vlcrolbzbaecam4yq)

# Explore a dashboard

Dashboards are a great place to start looking for data insights.
Dashboards allow you to visualize data from across your entire system in
one place. Datadog provides hundreds of out-of-the box (OOTB)
dashboards for common technologies and use cases. You can also create
custom dashboards based on your team's needs.
One of your teammates created a custom dashboard called Storedog 2.0
that brings together data and insights for Storedog from across Datadog.
You'll use this dashboard to start learning more about the
store-discounts service.
**1.**In the main menu, hover over**Dashboards** and select**[Dashboard List](https://app.datadoghq.com/dashboard/lists)** as shown in the screenshots below.
![image_1773045510684_0](http://127.0.0.1:47800/image/bafyreib4anh674vf2zuqa6mgxjnddvh76sflphujykir2trzcoxbd5vzju)
**2.** Browse the list that opens.
The list is populated with OOTB dashboards that were automatically
installed by Datadog based on Storedog's configuration. There's also one
custom dashboard called Storedog 2.0 (indicated in the image below).
![image_1773045567035_0](http://127.0.0.1:47800/image/bafyreihd34w4r6nchieebbgmscaa5k4qldvxrtgkj5wcsh7a33n6bqydxu)
**3.** Select**Storedog 2.0** from the list to open and browse the dashboard.
![image_1773045618169_0](http://127.0.0.1:47800/image/bafyreie3mdziu5sbfwgkvk5j232gi6v2f7expx3b6oxxtghqbbsfgypvce)
The building blocks of a dashboard are called widgets. The dashboard has
three groups of widgets: Overall Performance, Infrastructure &
Network, and Databases.
![image_1773045662290_0](http://127.0.0.1:47800/image/bafyreid4szw5dfviynynpczzvzjc64o5prwy5esk67blrzdkc6p3laukqy)
![image_1773045683309_0](http://127.0.0.1:47800/image/bafyreig2xe7kirabrj5isg4f2p4cjq5spl5jzu64dh4u5fvwwkjos75xjq)
**4.** Click the data in one of the dashboard widgets. As shown below, a menu
will open with details about the metric as well as options to navigate
to correlated data in other parts of Datadog. Across Datadog, you can
click the data in any chart and see options to view related data.
![image_1773045743654_0](http://127.0.0.1:47800/image/bafyreihyf7dflvg42hsqhoynot7q3djgrqgw4gu35clu6f75cyifs3ih6a)
**5.** To focus on data for the store-discounts service, update the filters below the dashboard title as shown in the image. Click**env** and select `quickstart-course`. Click**service** and select `store-discounts`.
![image_1773045806757_0](http://127.0.0.1:47800/image/bafyreicijfjq74ru23sgvyhvzr46j6oa67zpbrr4fjwzrnywodzfj7pa2e)
Notice that the data in the **SLO: Python service high errors**, the**Monitors Status**, and the**Error Rate % **widgets indicate that the store-discounts service has a high error rate. (SLO stands for Service Level Objective.) You decide to investigate these errors more.**6.** Next to the dashboard title, click the star icon to add the dashboard to your favorites. This is a great dashboard! You'll want to find it easily as you continue to work at Storedog.**7.** The Overall Performance widget group includes a list of**Related links**,
as shown in the image below. You ask a teammate about the list of
dashboard links. These dashboards are all OOTB dashboards that Datadog
automatically added to the account because your team is using the
specific services and tools or Datadog products. Your team member listed
the links here for easy access. You're curious to see what information
is included in the **Docker - Overview** dashboard and decide to explore it.
Click the [Docker - Overview dashboard](https://app.datadoghq.com/screen/integration/52/docker---overview) link in your Storedog 2.0 dashboard (indicated in the image below) to open the Docker - Overview dashboard.
![image_1773046072728_0](http://127.0.0.1:47800/image/bafyreif3x5gpmxnrddt7o5rh2lywvamkausiskffeouryzwcpbksakb5pi)
**8.** Browse the dashboard. Scroll from left to right and from top to bottom to view the full dashboard.
![image_1773046137011_0](http://127.0.0.1:47800/image/bafyreiemsq4rmczxhwemzwrofxz35icpltg2a3mwbs2yll5qu43egplnpe)
You'll see visualizations for data related to Containers, CPU Core
Load, Memory, and more. (The Events visualization below the Docker logo
will be blank.)
At a glance, you can't easily find data for the store-discounts
service in the dashboard. You can use the dashboard filters to narrow
the scope of the dashboard.
**9.** Below the dashboard title, click the**scope** menu. Type `service:store-discounts` and select that option.
![image_1773046392118_0](http://127.0.0.1:47800/image/bafyreidtgroysqjkelpe7ygpwk3x47lo72krdis7lcawsigoenli7wek4q)
Notice that the filters and filter options are different in this
dashboard compared to those in the Storedog2.0 dashboard. As you
continue to work with Dashboards in Datadog, you'll see the different
ways you can customize visualizations and filters in dashboards.
After setting the filter, the visualizations are displaying data for
the store-discounts service only. You may need to scroll down in this
dashboard to see the CPU Core Load and Memory charts in the screenshot
below.
![image_1773046453503_0](http://127.0.0.1:47800/image/bafyreiavxqo3jtds7qwdr3xxhv6j2duak3opabyiwawxrhxjyqafnpzwri)
Overall, the health of the store-discounts container looks good! The container isn't affecting the performance of the service.
**10.** Click the star icon next to the dashboard title to add this dashboard to your favorites.**11.** In the main navigation menu, hover over**Dashboards**. In the Dashboards submenu, you'll see**Docker - Overview** and**Storedog 2.0** listed in a new section for**Starred Dashboards & Notebooks**, as shown below.
![image_1773046547612_0](http://127.0.0.1:47800/image/bafyreifbfqiuwkyiishznkvqb6r6niy7zkxhajx6os5vx7baz3mxkk3na4)
You've browsed and bookmarked the dashboards. Your teammates mentioned
that you can also work with log data in Datadog. Click the **Search for logs** heading below to continue.

---

# Search for logs

Log Management in Datadog brings together and processes all your logs
into standardized, structured formats. In Logs, you can search and
analyze logs to learn more about and troubleshoot your systems. You can
also save your searches for future reference.
As a member of the store-discounts team, you're interested in seeing what logs are available for the store-discounts service.
You used the main navigation menu to find Dashboard List. This time,
you'll use Datadog's quick navigation tool to go to Log Explorer to
start exploring logs.

### 1. In the main navigation menu, click **Go t**o… to open the quick navigation tool.

![image_1773046672999_0](http://127.0.0.1:47800/image/bafyreihc4gype6d4l3sdj552sulrpo67yflaccgvgktpyh4wfhgg2lxtkm)

### 2. Browse the modal that opens. You'll see the list of products and pages that you can easily navigate to using this menu.

![image_1773046703546_0](http://127.0.0.1:47800/image/bafyreiffx244s64hcdvnvyj6wdgwas6p5de3zmh3d3fkqjobpbtxdkfyoa)

### 3. Type `Logs` into the search field. The options that appear for Logs match those you would see in the Logs submenu in the main navigation.

![image_1773046734832_0](http://127.0.0.1:47800/image/bafyreidmzo7vmht2i4lqpbkg4qro2wcrjzc5mapey4gkaivom4kzfpxypm)

### 4. Select **Logs** from the list.

> If you're redirected to a Get started with logs page because you're working in a new account, click on the Server tab to the left, then click on Explore Your Logs on the bottom-right of the page to enable the Logs view.

### 5. Browse the list of logs. You'll see logs from different services.

Above the search field, you'll see a time picker that you can use to select the time over which you want to view log data.
On the left of the list, you'll find a list of facets that you can use to filter the list.
![image_1773046804394_0](http://127.0.0.1:47800/image/bafyreiez3szk6sztuvg4vb5tf55otkgvjs2gdze7vispwlf22ncjcloq6e)
![image_1773046823719_0](http://127.0.0.1:47800/image/bafyreia3gts24pi6ev6afjz5tgxwtmpom23vrb52zsfgncqxh2kbb63x5a)

### 6. In the facets list on the left, under **Service**, select `store-discounts`.

`service:store-discounts` appears in the search field above the list of logs. The list will only display logs for this service.
![image_1773046933894_0](http://127.0.0.1:47800/image/bafyreiggberwtrcbe2yizbuuhejgvicrkoafvbb3vkqzt6fg4s5zimjan4)
![image_1773046961567_0](http://127.0.0.1:47800/image/bafyreibn3woh3wofwsuho6zlhhfm2kdz3fubhkdw32uh3p5idi2xsejcsm)

### 7. Click one of the logs with **CONTENT** displayed as `Discounts available: ###`. The log details panel will open.

The top of the panel displays all tags associated with the log as well as the log content.
Below the log content, you'll see tabs for **Fields & Attributes**,**Trace**,**Metrics**, and**Processes**. Check the content for each tab to see what data is correlated to the log.
![image_1773047025210_0](http://127.0.0.1:47800/image/bafyreihd6f4hp2umk2hp263kzrdmwt5uxuedcyhbuve5czztawa5mfpn6a)
Click the X in the top right of the panel to close it.

### 8. In the facets list, under **Status**, select `Error`.

`status:error` is now also listed in the search field above the list of logs.
![image_1773047097340_0](http://127.0.0.1:47800/image/bafyreicvgtngvyhmissug4mumo7rc7tngozgxwppsvrnfntexclu6gnq7e)

### 9. Click one of the logs with **CONTENT** displayed as `An error occurred while getting discounts.`

Notice that the status in the top left of the panel is `ERROR`.
![image_1773047256083_0](http://127.0.0.1:47800/image/bafyreihlmoxjz3tgiqbyvfiymp25ijqurpr4xgtu2l6wtvnbqi52fqktqq)
To quickly view the details of other logs in the list, you can use the up and down arrow keys of your keyboard.
Close the panel.

### 10. In the search field, hover over `status:error` and click the X that appears.

![image_1773047361876_0](http://127.0.0.1:47800/image/bafyreifi3uqlk6k3zm6ipoxrwvql2ju5qmvinzr36oyqi5iap5yftkmk5q)
You can also create visualizations using logs. In this case, you want to
create a visualization showing the percentage of error logs.

### 11. Below the search field, do the following to view the timeseries chart for the counts by status:

- Set **Visualize as** to `Timeseries`
- Leave **Show Count of** as `all logs`
- Set **by** to `Status`
![image_1773047460009_0](http://127.0.0.1:47800/image/bafyreiemzxrdv46s264ob6nhtgpm4ifilwqywyxgx3gaxr4lkqrwdtqkdy)

Hover over the bars to see the count values. You can see the counts of
logs, but not the percentages. You'll have to try another visualization
type.
![image_1773047493502_0](http://127.0.0.1:47800/image/bafyreidexk2yqhumdm3jyx3wn4rbtzuyj2u2zfy32fjxh27qw2dehdrubm)

### 12. Set **Visualize as** to `Pie Chart`.

![image_1773047546791_0](http://127.0.0.1:47800/image/bafyreih3zfyiulundcuibe4ixn4rucvbki73o34fnazntqs2nolqtnm6t4)
The pie chart displays the breakdown of count and percentage of logs by
status over the time range selected. You can save this visualization for
future use.

### 13. In the top left, above the search field, click **Views** to open the Saved Views list.

You'll see that some OOTB Saved Views are listed. Datadog installed these based on the log configurations for Storedog.
![image_1773047636579_0](http://127.0.0.1:47800/image/bafyreiak4vesh4nzatkf5r4lhpl7363mld6qm7lpprtantlvnfpwplygre)

### 14. At the top of the list, click **Save as new view**.

### 15. In the **New View** field that appeared, copy and paste the following name:

```
store-discounts status percentages
```
![image_1773047701203_0](http://127.0.0.1:47800/image/bafyreidtqnqnp7ivvemtv2pephr2t6aad3a7fcmvecu5efcirod2l4i554)

### 16. Click **Save**.

Your new view will appear at the top of the list.
![image_1773047744104_0](http://127.0.0.1:47800/image/bafyreiaydabteg5dpuv2zmrm5lfs2mtff3rgnasiv4en3o2pfysz45uw3u)

### 17. Click **Hide** above the list of Saved Views to close this panel.

### 18. The store-discounts logs look simple. To see more complex logs, set **Visualize as** to `List`.

![image_1773047807040_0](http://127.0.0.1:47800/image/bafyreifkvcaivxcc3wn6bn3ema4noq6si5h5skxyvr4uog65b2lpjxxvpa)

### 19. In the facets list, select `webserver` under **Service**.

### 20. Click one of the logs. View the log content and browse the **Fields & Attributes**.

![image_1773047880812_0](http://127.0.0.1:47800/image/bafyreicd7jjbnkxn53cn4i4gwp3eg77c6ka2wzh43ewaj6n7mbe5eovmta)
This log content is more complex than those for the store-discounts
service, but Datadog was able to extract all its details into an
easy-to-read format.
As you work more with logs in Datadog, you'll learn how to create
facets from event attributes so that you can search, filter, and group
your logs using details extracted from the logs themselves.

### 21. Close the panel.

As you browsed the store-discounts logs, you saw that they have trace
data from Application Performance Monitoring (APM) correlated to them.
You want to learn more about the service and the other services it
interacts with. Software Catalog provides an overview of that
information. Click the **Find service details** heading below to continue.

---

# Find service details

Software Catalog provides an overview of services in your systems. You
can find important details about team ownership, service reliability,
application performance, application security, costs, and delivery.

### 1. Using the main menu or the **Go t**o… tool, navigate t**[o Automation > Internal Developer Portal > Software Catal](https://app.datadoghq.com/services?lens=Ownership)**og.

![image_1773048112088_0](http://127.0.0.1:47800/image/bafyreicc2xosdx2ip2wtfaaunwptunpx3ciiqcule3ykf3s6bn2rblbp7q)
The page will open on the **Service List** and the**Ownership** tab. You'll also see tabs for**Reliability**,**Performance**,**Security**,**Costs**, and**Delivery**.
![image_1773048158649_0](http://127.0.0.1:47800/image/bafyreicjathyq3htiqzr2z7eld4bo27tsvbsptviyjt4a2xj4xhlmye3eq)

### 2. Above the list of services, click the `env:\*` menu and select `env:quickstart-course` to filter the list to the services for Storedog.

![image_1773048240725_0](http://127.0.0.1:47800/image/bafyreientpz4braaynsd5bkta3vqkn2hfrkdrdo6nfjnqp3w4p66hdgzqe)

### 3. For the **store-discounts** service, hover over the icons in the columns to see the available details. The icons under**Telemetry** are shortcuts to the available data for the service. You may need to scroll to the right to see all available columns.

![image_1773048333972_0](http://127.0.0.1:47800/image/bafyreigbl45zjrpia3kb6keo24ludbr7s6qwi2ui4u2upar6vzcas3prfa)

### 4. Click the **Performance** tab above the list of services. For each service, you'll see key APM metrics for requests, latency, and

error rate. You'll also see the number and status of any monitors for each service. You may need to scroll to the right to see all available columns.
![image_1773048405503_0](http://127.0.0.1:47800/image/bafyreiehfsbxwk3vbccclivftmvthq63ocby3kumvjfa7byfdk3q7uftfi)

> You can navigate directly to the Performance tab of Software Catalog Catalog using APM > Software Catalog in the main navigation menu.

### 5. Click the **store-discounts** service. A panel will open in the**Performance** tab of the service details.

![image_1773048470460_0](http://127.0.0.1:47800/image/bafyreihx6j5ixo6qchgjtivqmdwnxdrbkvyj35nfrfnbdwka7fehqh2gam)
Here you can get a quick view of key visualizations for service
performance. In the top right of the panel, you also have the option to
go to the Service Page in APM to view more details about the service's
performance.

### 6. Click the **Ownership** tab. You'll see information about the service, such as linked Documentation, Runbooks, and Dashboards in addition to the links you saw earlier for Team, On-call, and Contacts.

![image_1773048551661_0](http://127.0.0.1:47800/image/bafyreif6zzxsdzjdptrclszjgaylkaqcm3zwipopmf35rsoiqdogyynnfm)

### 7. In the lower half of the panel, you can find more information related to service setup, linked dashboards, service dependencies, and more.

![image_1773048611013_0](http://127.0.0.1:47800/image/bafyreidzbmwh5tv7udt3o6mheuvzf6c3vjnq7ncwbjpsij3ldzbeazo5ha)

### 8. In the top right of the panel, click the arrow next to **Service Page**. This opens a menu for related pages you can navigate to. Leave this menu open.

![image_1773048659267_0](http://127.0.0.1:47800/image/bafyreifi2o3em72hvoyupbq5nziuwfhjcc44vf5yvf3bvuorogtj4e7k3u)
Software Catalog is a centralized view of services that your teams are
monitoring with Datadog. As you saw in Dashboards and Logs, you're also
able to navigate to correlated data and assets, such as monitors, from
Software Catalog. From here, you can try exploring a monitor for the
store-discounts service. Click the **Interpret a monitor** heading below to continue.

---

# Interpret a monitor

A monitor is an alert that notifies you and your team when a
user-defined threshold for a metric has been exceeded or if the status
of an asset in Datadog (such as an SLO or a synthetics test) has
changed. For example, a member of the store-discounts team has created
an APM Monitor that notifies the team if the error rate of the service
exceeds a certain value.

### 1. In the **Service Page** menu options, click**Monitors**. A new tab will open with the**Manage Monitors** list filtered to `service:store-discounts`.

![image_1773049170815_0](http://127.0.0.1:47800/image/bafyreidbiptsm4xzvbgf64vbhe5arl7y2d77t34xiw7g4iz3twbeugvb4y)
![image_1773049197275_0](http://127.0.0.1:47800/image/bafyreialufon424gz35ufixls6fna2a3gzc4maigah6ox3utf7x33qjisa)
Notice that some monitors have an ALERT or WARN status.

### 2. Click the monitor named `Service store-discounts has a high error rate` to open the monitor's status page.

![image_1773049235613_0](http://127.0.0.1:47800/image/bafyreiclgguvdiaewalio45bxhmye2mn654akjd3q3vu2y5bbfukmknq34)
Within the header you will be able to see the Monitor Status, Type,
Creation Date and Author. You will also see Associated Teams and
Services if they are available.
On the right, you can view the Query details, Evaluation, and
Notification Count with listed recipients. You can hover over the query
to see the full query details if needed.
The query reads as: "Taking the sum over the last 10 min, if the sum
of the errors divided by the sum of the requests (that is, the error
rate) is greater than 0.05, the status is ALERT."
Notice that the query includes the `env` and `service` tags for store-discounts. This ensures that data for only this service is being queried and alerted on by this monitor.

### 4. Browse the Event Details, located at the bottom of the Monitor Status page.

![image_1773049442164_0](http://127.0.0.1:47800/image/bafyreige362rk23f35nwgy2atcb3n7xup5f3smw27ztwan4cjkl7wiytlm)
You'll see the Message Template and Recipients.
The message in this monitor is simple, but as you work with monitors,
you'll learn how to include variables, link to dashboards and runbooks,
and send notifications to third party apps such as Slack and PagerDuty.
Whenever there is a change in status, your team will receive a notification about the Monitor Status at `eng-discounts@company.com`.
![image_1773049420398_0](http://127.0.0.1:47800/image/bafyreicuo66ytpn7ra3oyr7vvogfe2lfmn4wh6ik2a6nel7v33dwzzvwfq)

### 5. Browse the details for **Monitor Behavior**.

![image_1773049562482_0](http://127.0.0.1:47800/image/bafyreigt3s3tkrhrihbrk4krcv4nslsmnfuzprj5ni5up33245zxhkvonq)
You'll see a bar graph indicating the status over time and two timeseries graphs for the calculated query metric.

As a member of the store-discounts team, you now know where to start
looking in Datadog for key data and insights about the store-discounts
service.
To do some optional exercises, click the **Try it yourself! (optional)** heading below. To complete the lab, click the**Lab summary** heading instead.

---

# Try it yourself! (optional)

## 1. Find and open your saved view in Logs.

> Solution

Go to **[Logs > Search & Analytics > Explorer](https://app.datadoghq.com/logs)** using the main navigation menu or the quick navigation tool. Click**Views** in the top left. Select your saved view in the list.
![image_1773050013454_0](http://127.0.0.1:47800/image/bafyreifactgkdfvxgh5vq2vkcrcrtmnonrkijazexrolbdmc5lvsrtqh74)

## 2. Find the Manage Monitors page and search for the store-discounts monitors.

> Solution

Go to **[Monitoring > Monitor List](https://app.datadoghq.com/monitors/manage)**.
![image_1773050084979_0](http://127.0.0.1:47800/image/bafyreietsh5wiuu7zwsjxj26tug6rz6yucgrtj3mvtav3ijsir5egfmqky)
In the facets list, select `store-discounts` under **Service**.
![image_1773050108204_0](http://127.0.0.1:47800/image/bafyreie2wdltys344zssk22jnyxj523llo3zl4tqrjzaneeuckqieb4nsa)

Click the **Lab summary** heading below to complete the lab.

---

# Lab summary

In this lab, you did the following:
- Explored OOTB and custom dashboards from Dashboards List
- Searched and visualized log data in Logs
- Viewed service details in Software Catalog
- Interpreted a monitor in Manage Monitors

You used the following tools to find the data and assets:
- The main navigation menu
- The **Go to...** quick navigation tool
- Links and menus for correlated data and assets on product pages

This is just the start of your journey with Datadog! To learn more
about Dashboards, Logs, Software Catalog, and Monitors, take the [Datadog Foundation](https://learn.datadoghq.com/courses/datadog-foundation) course
.
