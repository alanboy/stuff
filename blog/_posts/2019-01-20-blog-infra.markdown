---
layout: post
title:  "How this blog works"
description: 
date:   2019-01-20 23:45:29 -0800
categories: engineering
tags: azure
published: true
---

This blog is a git repo hosted in GitHub. Every push to master triggers a CI build in AzureDevops which builds the site using Jekyll and pushes the results to a Blob Storage account in Azure. The Blob Storage has HTTP access enabled with a custom domain.

    this is some code!

Building the jekyll site:

    gem install bundler  jekyll  
    bundle
    bundle exec jekyll build
    ls _site
    

Uploading the files to storage account:

    #!/bin/bash
    export AZURE_STORAGE_ACCOUNT="alanboyblog"
    export container_name=\$web
    
    cd _site
    
    for f in $(find . -type f); do echo "Uploading ${f:2} ..." 
        && az storage blob upload --container-name $container_name --file ${f:2} --name ${f:2} ;
         done
    

I created a custom Jekyll theme that uses SeleniumUI for the HTML elements.

For the search, during build-time we create a js file which contains metadata for all the posts and provide that as an input to the search element.

To include mermaid, do this:

    <div class="mermaid">
    sequenceDiagram
        Alice ->> Bob: Hello Bob, how are you?
        Bob-->>John: How about you John?
        Bob--x Alice: I am good thanks!
        Bob-x John: I am good thanks!
    </div>
    
    
    <div class="mermaid">
    graph TD
      A[Christmas] -->|Get money| B(Go shopping)
      B --> C{Let me think}
      C -->|One| D[Laptop]
      C -->|Two| E[iPhone]
      C -->|Three| F[fa:fa-car Car]
    </div>
    

Some helpful links in the process
---------------------------------

*   [https://alanboy.visualstudio.com/blog/\_apps/hub/ms.vss-ciworkflow.build-ci-hub?\_a=edit-build-definition&id=2&view=Tab\_Triggers](https://alanboy.visualstudio.com/blog/_apps/hub/ms.vss-ciworkflow.build-ci-hub?_a=edit-build-definition&id=2&view=Tab_Triggers)
*   [https://azure.microsoft.com/en-us/blog/azure-storage-static-web-hosting-public-preview/](https://azure.microsoft.com/en-us/blog/azure-storage-static-web-hosting-public-preview/)
*   [https://docs.microsoft.com/en-us/azure/storage/blobs/storage-custom-domain-name](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-custom-domain-name)
*   [https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-cli#specify-storage-account-credentials](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-cli#specify-storage-account-credentials)
*   [https://docs.microsoft.com/en-us/azure/storage/common/storage-azure-cli](https://docs.microsoft.com/en-us/azure/storage/common/storage-azure-cli)
*   [https://docs.microsoft.com/en-us/cli/azure/storage/blob/copy?view=azure-cli-latest#az-storage-blob-copy-start](https://docs.microsoft.com/en-us/cli/azure/storage/blob/copy?view=azure-cli-latest#az-storage-blob-copy-start)
*   [https://jekyllrb.com/docs/](https://jekyllrb.com/docs/)
*   [https://mermaid-js.github.io/mermaid-live-editor/#/edit/](https://mermaid-js.github.io/mermaid-live-editor/#/edit/)