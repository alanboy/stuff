---
layout: post
title: "Azure DevOps"
date: 2020-03-09 10:22:00 -0800
categories: software
published: true
description: "The Azure DevOps has a very rich REST API that allows you to integrate your business practices with it."
---

# Azure DevOps REST API
https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page

## Calling with C# - HTTP
1. Create a new PAT
1. Concatenate `:<pat>` where pat is your PAT and [base64 that string](https://www.base64encode.org/).
1. Add it as the `Authentication` header.

```cs
// We can call the REST API using simple HTTP Requests
client.DefaultRequestHeaders.Accept.Add(
new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

// Setup the Basic authorization using a PAT
client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic",
Convert.ToBase64String(
    System.Text.ASCIIEncoding.ASCII.GetBytes(
        string.Format("{0}:{1}", "", personalaccesstoken))));

// Call an API and read it's contents
using (HttpResponseMessage response = await client.GetAsync(
        "https://dev.azure.com/{organization}/_apis/projects"))
{
    response.EnsureSuccessStatusCode();
    string responseBody = await response.Content.ReadAsStringAsync();
    Console.WriteLine(responseBody);
}
```
## Calling with C# - SDK

```cs
    VssConnection connection
            = new VssConnection(new Uri(collectionUri), new VssBasicCredential("alan@msn.com", "pat"));

    // ===
    VssTokenStorage tokenStorage = VssTokenStorageFactory.GetTokenStorageNamespace("VisualStudio");
    IEnumerable<VssToken> vssTokens = tokenStorage.RetrieveAll("VssApp");
    foreach (VssToken v in vssTokens)
        Console.WriteLine(v.Resource + ", " + v.Type + ", " + v.UserName + ", " + v.ToString());

    // ===
    // Visual Studio Sign-in Prompt
    //VssConnection connection = new VssConnection(new Uri(collectionUri), new VssClientCredentials());
    

    // ====
    //VssClientCredentialStorage ccs2 = new VssClientCredentialStorage();
    //VssFederatedToken ct2 = (VssFederatedToken)ccs2.RetrieveToken(new Uri(collectionUri), VssCredentialsType.Federated);
    //VssConnection connection = new VssConnection(new Uri(collectionUri), new VssFederatedCredential(ct2));
```

## Calling with CLI

Run a build pipeline:
```
az pipelines run --id 11446 --open --branch users/alan/my-branch
```


## Calling with POSTMAN

## Calling a REST API from PowerShell

## Calling with JavasScript

```js
function VstsApiRequest(url, method, data) {
        method = method || "GET";
        data = data || {};

        const authHeader = "Basic " + btoa(":" + pat);
        let options = {
            type: method,
            url: baseUrl + url,
            dataType: "json",
            contentType: "application/json",
            beforeSend: function(request) {
                    request.setRequestHeader("Authorization", authHeader);
                    request.setRequestHeader("Accept", "application/json;api-version=5.1"  );
                }
        };

        if (data !== undefined) {
            options.data = (JSON.stringify(data));
        }

        return new Promise(
            function(resolve, reject) {
                $.ajax(options).done(resolve).fail(reject);
        })
    }
```

## Posting to a pull request

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

## Postman request

Use this pre-request script in postman, and now you'll just need to save your PAT 

```
pm.collectionVariables.set('authBasicToken', btoa(':'+ pm.collectionVariables.get("pat")))
```