---
layout: post
title: "Azure DevOps"
date: 2020-03-09 10:22:00 -0800
categories: azuredevops
published: true
description:
---

1. Create a new PAT
1. Concatenate `:<pat>` where pat is your PAT and [base64 that string](https://www.base64encode.org/).
1. Add it as the `Authentication` header.

```cs
client.DefaultRequestHeaders.Accept.Add(
new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic",
Convert.ToBase64String(
    System.Text.ASCIIEncoding.ASCII.GetBytes(
        string.Format("{0}:{1}", "", personalaccesstoken))));

using (HttpResponseMessage response = await client.GetAsync(
        "https://dev.azure.com/{organization}/_apis/projects"))
{
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
Console.WriteLine(responseBody);
}
```

## Calling with POSTMAN



## Calling a REST API from PowerShell

## Posting to a pull request
https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page

https://docs.microsoft.com/en-us/rest/api/azure/devops/git/pull%20request%20thread%20comments/create?view=azure-devops-rest-5.1#commenttype

Get the build URI:
Env variable = BUILD_BUILDURI

Get the test runs for this build (note the version must be 5.1):
https://dev.azure.com/{{organization}}/{{project}}/_apis/test/Runs?buildUri=vstfs:///Build/Build/3576745
Look for 'integration test' which is 4014504

Get the test results for this test run (note the version must be 5.1):
https://dev.azure.com/{{organization}}/{{project}}/_apis/test/runs/4014418/results

this has an id and a testcase name:
"id": 100000,
"testCase": { "name": "should display welcome message" },

Now you can upload an attachment:
https://dev.azure.com/{{organization}}/{{project}}/_apis/test/Runs/4013424/attachments?api-version=5.1-preview.1