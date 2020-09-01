---
layout: post
title: "swagger-codegen"
date: 2020-05-20 11:39:00 -0800
categories: swagger-codegen
published: true
description:
---

# Swagger 3

## Creating a custom code generator for Slim

Download current stable 3.x.x branch (OpenAPI version 3)

```
wget 
  https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.20/swagger-codegen-cli-3.0.20.jar 
    -O swagger-codegen-cli.jar
```

or using curl:

```
curl 
  https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.20/swagger-codegen-cli-3.0.20.jar  
    --output swagger-codegen-cli.jar
```

Show help using

    java -jar swagger-codegen-cli.jar -help

Show all the supported languages

    java -jar swagger-codegen-cli.jar langs

To start our new generator; we'll need to create some boilerplate code. We can easily do this with the `meta` command:

    java -jar swagger-codegen-cli.jar meta -o output/slim -n slim -p net.alanboy.swagger

In the previous command

* `meta` is the subcommand to construct all the codegen boilerplate.
* `-o` where to write  the  generated  files
* `-n` the human-readable name of the generator
* `-p` the package to put  the  main class into

Running that command will leave us with the following files:

```bash
output
output\slim
output\slim\README.md
output\slim\pom.xml
output\slim\src
output\slim\src\main
output\slim\src\main\java
output\slim\src\main\java\net
output\slim\src\main\java\net\alanboy
output\slim\src\main\java\net\alanboy\swagger
output\slim\src\main\java\net\alanboy\swagger\SlimGenerator.java
output\slim\src\main\resources
output\slim\src\main\resources\META-INF
output\slim\src\main\resources\META-INF\services
output\slim\src\main\resources\META-INF\services\io.swagger.codegen.v3.CodegenConfig
output\slim\src\main\resources\slim
output\slim\src\main\resources\slim\api.mustache
output\slim\src\main\resources\slim\model.mustache
output\slim\src\main\resources\slim\myFile.mustache
```

We can now go ahead and build them:

    output\slim>mvn package

With this, we have created a new jar file:

    output\slim\target\slim-swagger-codegen-1.0.0.jar

Ok, so we have our client, which allowed us to build a basic (empty) code generator, which we have just built.

In order to try it, we need an OpenAPI yaml file. [This pet store example](https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v3.0/petstore.yaml) seems to be the canonical example. So grab that and put it in the root and call it petstore.yaml:

    curl https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore.yaml  --output pets
tore.yaml

Ok, let's actually build some generated code using our new slim code generator.

```
java -classpath swagger-codegen-cli.jar;output\slim\target\slim-swagger-codegen-1.0.0.jar  ^
   io.swagger.codegen.v3.cli.SwaggerCodegen ^
   generate ^
  -i petstore.yaml ^
  -l slim ^
  -o generated-code/slim
```

If this worked, we now have a generated structure that looks like this:

```bash
generated-code\slim
generated-code\slim\.swagger-codegen
generated-code\slim\.swagger-codegen-ignore
generated-code\slim\.swagger-codegen\VERSION
generated-code\slim\myFile.sample
generated-code\slim\src
generated-code\slim\src\io
generated-code\slim\src\io\swagger
generated-code\slim\src\io\swagger\client
generated-code\slim\src\io\swagger\client\api
generated-code\slim\src\io\swagger\client\api\PetsApi.sample
generated-code\slim\src\io\swagger\client\model
generated-code\slim\src\io\swagger\client\model\Error.sample
generated-code\slim\src\io\swagger\client\model\Pet.sample
generated-code\slim\src\io\swagger\client\model\Pets.sample
```

Ok, let's open these two side by side:

```bash
{% raw %}
  1                                                                          |  1
  2 # This is a sample api mustache template.  It is representing a ficticous|  2 # This is a sample api mustache template.  It is representing a ficticous
  3 # language and won't be usable or compile to anything without lots of cha|  3 # language and won't be usable or compile to anything without lots of cha
  4 # Use it as an example.  You can access the variables in the generator ob|  4 # Use it as an example.  You can access the variables in the generator ob
  5 # like such:                                                             |  5 # like such:
  6                                                                          |  6
  7 # use the package from the `apiPackage` variable                         |  7 # use the package from the `apiPackage` variable
  8 package: {{package}}                                                     |  8 package: io.swagger.client.api
  9                                                                          |  9
 10 # operations block                                                       | 10 # operations block
 11 {{#operations}}                                                          | 11 classname: PetsApi
 12 classname: {{classname}}                                                 | 12
 13                                                                          | 13 # loop over each operation in the API:
 14 # loop over each operation in the API:                                   | 14
 15 {{#operation}}                                                           | 15 # each operation has an `operationId`:
 16                                                                          | 16 operationId: createPets
 17 # each operation has an `operationId`:                                   | 17
 18 operationId: {{operationId}}                                             | 18 # and parameters:
 19                                                                          | 19
 20 # and parameters:                                                        | 20
 21 {{#allParams}}                                                           | 21 # each operation has an `operationId`:
 22 {{paramName}}: {{dataType}}                                              | 22 operationId: listPets
 23 {{/allParams}}                                                           | 23
 24                                                                          | 24 # and parameters:
 25 {{/operation}}                                                           | 25 limit: Integer
 26                                                                          | 26
 27 # end of operations block                                                | 27
 28 {{/operations}}                                                          | 28 # each operation has an `operationId`:
~                                                                            | 29 operationId: showPetById
~                                                                            | 30
~                                                                            | 31 # and parameters:
~                                                                            | 32 petId: String
~                                                                            | 33
~                                                                            | 34
~                                                                            | 35 # end of operations block
{% endraw %}
```


According to the Slim Framework website, this is the minimal we need for a working API:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->get('/hello/{name}', function (Request $request, Response $response, array $args) {
    $name = $args['name'];
    $response->getBody()->write("Hello, $name");
    return $response;
});

$app->run();
```

So let's start making the mustache look like this our desired output. We are going to be iterating this a buch of times, lets create a `run.cmd` script:

```
rem Build the generator
call mvn -Dmaven.test.skip=true --file output\slim\pom.xml package

rem Generate code
java -classpath swagger-codegen-cli.jar;output\slim\target\slim-swagger-codegen-1.0.0.jar  ^
   io.swagger.codegen.v3.cli.SwaggerCodegen ^
   generate ^
  -i petstore.yaml ^
  -l slim ^
  -o generated-code/slim
```

So we can now, change the mustache files and run `run.cmd` and see the output in the generated code.

```bash
{% raw %}
  1 <?php                                                                    |  1 <?php
  2                                                                          |  2
  3 use Psr\Http\Message\ResponseInterface as Response;                      |  3 use Psr\Http\Message\ResponseInterface as Response;
  4 use Psr\Http\Message\ServerRequestInterface as Request;                  |  4 use Psr\Http\Message\ServerRequestInterface as Request;
  5 use Slim\Factory\AppFactory;                                             |  5 use Slim\Factory\AppFactory;
  6                                                                          |  6
  7 require __DIR__ . '/../vendor/autoload.php';                             |  7 require __DIR__ . '/../vendor/autoload.php';
  8                                                                          |  8
  9 $app = AppFactory::create();                                             |  9 $app = AppFactory::create();
 10                                                                          | 10
 11 {{#operations}}                                                          | 11
 12                                                                          | 12 $app->POST('/pets', function (Request $request, Response $response, array
 13 {{#operation}}                                                           | 13     $response->getBody()->write("Hello, $name");
 14 $app->{{httpMethod}}('{{path}}', function (Request $request, Response $re| 14     return $response;
 15     {{#allParams}}                                                       | 15 });
 16     ${{paramName}} = $args['{{paramName}}'];                             | 16
 17     {{/allParams}}                                                       | 17 $app->GET('/pets', function (Request $request, Response $response, array
 18     $response->getBody()->write("Hello, $name");                         | 18     $limit = $args['limit'];
 19     return $response;                                                    | 19     $response->getBody()->write("Hello, $name");
 20 });                                                                      | 20     return $response;
 21                                                                          | 21 });
 22 {{/operation}}                                                           | 22
 23 {{/operations}}                                                          | 23 $app->GET('/pets/{petId}', function (Request $request, Response $response
 24                                                                          | 24     $petId = $args['petId'];
 25 $app->run();                                                             | 25     $response->getBody()->write("Hello, $name");
~                                                                            | 26     return $response;
~                                                                            | 27 });
~                                                                            | 28
~                                                                            | 29
~                                                                            | 30 $app->run();
{% endraw %}
```

I took some of the template variables from [here](https://github.com/swagger-api/swagger-codegen/wiki/Mustache-Template-Variables#mustache-template-variables-in-the-operation).

Ok, so we've proved that we can actually start building the output code using our new generator.

First thing to note is that we are developing for codegen v3, which uses handlebars. [Check this for more information on mustache and handlebars](https://jknack.github.io/handlebars.java/gettingStarted.html). Also [this](https://stackoverflow.com/questions/10555820/what-are-the-differences-between-mustache-js-and-handlebars-js).

We are writing a code gen for swagger 3, there is already support for slim in v2, so i took a lookt at [one of the mustache files](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/resources/slim/index.mustache) and just copy paster

this did not work out of the box, so i want to know what are the variables that i have at my disposal, i can do this by adding `-DdebugOperations` to my `generate` command in `run.cmd`:

    java -DdebugOperations -classpath swagger-codegen-cli.jar;output\slim\target\slim-swagger-codegen-1.0.0.jar  ^
       io.swagger.codegen.v3.cli.SwaggerCodegen ^
       generate ^
      -i petstore.yaml ^
      -l slim ^
      -o generated-code/slim

Other debug configurations are: 

   -DdebugSwagger prints the swagger specification as interpreted by the codegen
   -DdebugModels prints models passed to the template engine
   -DdebugOperations prints operations passed to the template engine
   -DdebugSupportingFiles prints additional data passed to the template engine

This will put a `00:06:47.361 [main] INFO io.swagger.codegen.v3.DefaultGenerator - ############ Model info ############` section with useful information.

This is what helped me realize that `{apiInfo}` is no longer supported? So I took out pieces that were not supported and got to a point where stuff seems to be working:

```bash
{% raw %}
  1 <?php                                                                    |  1 <?php
  2 /**                                                                      |  2 /**
  3  * {{appName}}                                                           |  3  * Swagger Petstore
  4  * @version {{appVersion}}                                               |  4  * @version 1.0.0
  5  */                                                                      |  5  */
  6                                                                          |  6
  7 require_once __DIR__ . '/vendor/autoload.php';                           |  7 require_once __DIR__ . '/vendor/autoload.php';
  8                                                                          |  8
  9 $app = new Slim\App();                                                   |  9 $app = new Slim\App();
 10                                                                          | 10
 11 {{#operations}}{{#operation}}                                            | 11 /**
 12 /**                                                                      | 12  * POST createPets
 13  * {{httpMethod}} {{nickname}}                                           | 13  * Summary: Create a pet
 14  * Summary: {{summary}}                                                  | 14  * Notes:
 15  * Notes: {{notes}}                                                      | 15  * Output-Formats: [application/json]
 16 {{#hasProduces}} * Output-Formats: [{{#produces}}{{{mediaType}}}{{#hasMor| 16  */
 17  */                                                                      | 17 $app->POST('/v1/pets', function($request, $response, $args) {
 18 $app->{{httpMethod}}('{{{basePathWithoutHost}}}{{{path}}}', function($req| 18
 19             {{#hasHeaderParams}}$headers = $request->getHeaders();{{/hasH| 19
 20             {{#hasQueryParams}}$queryParams = $request->getQueryParams();| 20
 21             {{#queryParams}}${{paramName}} = $queryParams['{{paramName}}'| 21
 22             {{#hasFormParams}}{{#formParams}}${{paramName}} = $args['{{pa| 22             $response->write('How about implementing createPets as a POST
 23             {{#hasBodyParam}}$body = $request->getParsedBody();{{/hasBody| 23             return $response;
 24             $response->write('How about implementing {{nickname}} as a {{| 24             });
 25             return $response;                                            | 25
 26             });                                                          | 26 /**
 27                                                                          | 27  * GET listPets
 28 {{/operation}}{{/operations}}                                            | 28  * Summary: List all pets
 29                                                                          | 29  * Notes:
 30                                                                          | 30  * Output-Formats: [application/json]
 31 $app->run();                                                             | 31  */
~                                                                            | 32 $app->GET('/v1/pets', function($request, $response, $args) {
~                                                                            | 33
~                                                                            | 34             $queryParams = $request->getQueryParams();
~                                                                            | 35             $limit = $queryParams['limit'];
~                                                                            | 36
~                                                                            | 37
~                                                                            | 38             $response->write('How about implementing listPets as a GET me
~                                                                            | 39             return $response;
~                                                                            | 40             });
~                                                                            | 41
~                                                                            | 42 /**
~                                                                            | 43  * GET showPetById
~                                                                            | 44  * Summary: Info for a specific pet
~                                                                            | 45  * Notes:
~                                                                            | 46  * Output-Formats: [application/json]
~                                                                            | 47  */
~                                                                            | 48 $app->GET('/v1/pets/{petId}', function($request, $response, $args) {
~                                                                            | 49
~                                                                            | 50
~                                                                            | 51
~                                                                            | 52
~                                                                            | 53             $response->write('How about implementing showPetById as a GET
~                                                                            | 54             return $response;
~                                                                            | 55             });
~                                                                            | 56
~                                                                            | 57
~                                                                            | 58
~                                                                            | 59 $app->run();
{% endraw %}
```

Running that slim didnt actually work for me, so i acommodated the  example from the slim website:

```bash
{% raw %}
  1 <?php                                                                    |  1 <?php
  2                                                                          |  2
  3 /**                                                                      |  3 /**
  4  * {{appName}}                                                           |  4  * Swagger Petstore
  5  * @version {{appVersion}}                                               |  5  * @version 1.0.0
  6  */                                                                      |  6  */
  7                                                                          |  7
  8 use Psr\Http\Message\ResponseInterface as Response;                      |  8 use Psr\Http\Message\ResponseInterface as Response;
  9 use Psr\Http\Message\ServerRequestInterface as Request;                  |  9 use Psr\Http\Message\ServerRequestInterface as Request;
 10 use Slim\Factory\AppFactory;                                             | 10 use Slim\Factory\AppFactory;
 11                                                                          | 11
 12 require __DIR__ . '/../../vendor/autoload.php';                          | 12 require __DIR__ . '/../../vendor/autoload.php';
 13                                                                          | 13
 14 $app = AppFactory::create();                                             | 14 $app = AppFactory::create();
 15                                                                          | 15
 16 // Add error middleware                                                  | 16 // Add error middleware
 17 $app->addErrorMiddleware(true, true, true);                              | 17 $app->addErrorMiddleware(true, true, true);
 18 $app->setBasePath("/api/index.php");                                     | 18 $app->setBasePath("/api/index.php");
 19                                                                          | 19
 20 {{#operations}}{{#operation}}                                            | 20 /**
 21 /**                                                                      | 21  * POST createPets
 22  * {{httpMethod}} {{nickname}}                                           | 22  * Summary: Create a pet
 23  * Summary: {{summary}}                                                  | 23  * Notes:
 24  * Notes: {{notes}}                                                      | 24  * Output-Formats: [application/json]
 25 {{#hasProduces}} * Output-Formats: [{{#produces}}{{{mediaType}}}{{#hasMor| 25  */
 26  */                                                                      | 26 $app->POST('/v1/pets', function($request, $response, $args) {
 27 $app->{{httpMethod}}('{{{basePathWithoutHost}}}{{{path}}}', function($req| 27
 28             {{#hasHeaderParams}}$headers = $request->getHeaders();{{/hasH| 28
 29             {{#hasQueryParams}}$queryParams = $request->getQueryParams();| 29
 30             {{#queryParams}}${{paramName}} = $queryParams['{{paramName}}'| 30
 31             {{#hasFormParams}}{{#formParams}}${{paramName}} = $args['{{pa| 31             $response->getBody()->write("Hello world!");
 32             {{#hasBodyParam}}$body = $request->getParsedBody();{{/hasBody| 32             return $response;
 33             $response->getBody()->write("Hello world!");                 | 33             });
 34             return $response;                                            | 34
 35             });                                                          | 35 /**
 36                                                                          | 36  * GET listPets
 37 {{/operation}}{{/operations}}                                            | 37  * Summary: List all pets
 38                                                                          | 38  * Notes:
 39 $app->run();                                                             | 39  * Output-Formats: [application/json]
~                                                                            | 40  */
~                                                                            | 41 $app->GET('/v1/pets', function($request, $response, $args) {
~                                                                            | 42
~                                                                            | 43             $queryParams = $request->getQueryParams();
~                                                                            | 44             $limit = $queryParams['limit'];
~                                                                            | 45
~                                                                            | 46
~                                                                            | 47             $response->getBody()->write("Hello world!");
~                                                                            | 48             return $response;
~                                                                            | 49             });
{% endraw %}
```

Ok, we are geeting somewhere. At this point I started tweaking the mustache and actually running the slim code in my webserver to make sure it worked. Turns out this example json, the pet store does not take any

Now ill start creating a more complex API using https://studio.apicur.io/ so that i can visually add/remove apis, arguments, reponses, etc....

I then drag that and insert it and run...

Ok, we have proved that the mustache works. now for the real custom generator that i need, i need actually 3 files:

* The API surface. This will be the Slim Framework code that we saw
* The controllers interfaces. These interfaces are what the controllers must implement.
* The controllers themselves. These have the actual code logic, busines rules and everything behind the API.

For this, we'll need to modify the 

```
\Code\swagger-codegen-test2\output\slim\src\main\java\net\alanboy\swagger\SlimGenerator.java
```

This file drives the generation process. The comments _are_ the documentation i suppose.

```java
package net.alanboy.swagger;                                                                                                                                                                                                                                                                                             2

import io.swagger.codegen.v3.*;
import io.swagger.codegen.v3.generators.DefaultCodegenConfig;

import java.util.*;
import java.io.File;

public class SlimGenerator extends DefaultCodegenConfig {

  // source folder where to write the files
  protected String sourceFolder = "src";
  protected String apiVersion = "1.0.0";

  /**
   * Configures the type of generator.
   *
   * @return  the CodegenType for this generator
   * @see     io.swagger.codegen.CodegenType
   */
  public CodegenType getTag() {
    return CodegenType.CLIENT;
  }

  /**
   * Configures a friendly name for the generator.  This will be used by the generator
   * to select the library with the -l flag.
   *
   * @return the friendly name for the generator
   */
  public String getName() {
    return "slim";
  }
```


I changed of that to this:

```java
package net.alanboy.swagger;

import io.swagger.codegen.v3.*;
import io.swagger.codegen.v3.generators.DefaultCodegenConfig;

import java.util.*;
import java.io.File;

public class SlimGenerator extends DefaultCodegenConfig {

  // source folder where to write the files
  protected String sourceFolder = "src";
  protected String apiVersion = "1.0.0";

  public CodegenType getTag() {
    return CodegenType.SERVER;
  }

  public String getName() {
    // the friendly name for the generator
    return "slim";
  }

  public String getHelp() {
    // Returns human-friendly help for the generator
    return "Generates a slim server stub.";
  }

  public SlimGenerator() {
    super();

    // set the output folder here
    outputFolder = "generated-code/slim";

    /**
     * Api classes.  You can write classes for each Api file with the apiTemplateFiles map.
     * as with models, add multiple entries with different extensions for multiple files per
     * class
     */
    apiTemplateFiles.put( "api.mustache", ".api.php");
    apiTemplateFiles.put( "interfaces.mustache", ".interfaces.php");
    apiTemplateFiles.put( "controllers.mustache", ".controller.php");

    /**
     * Supporting Files.  You can write single files for the generator with the
     * entire object tree available.  If the input file has a suffix of `.mustache
     * it will be processed by the template engine.  Otherwise, it will be copied
     * //  the destination folder, relative `outputFolder`
     */
    //supportingFiles.add(new SupportingFile("interfaces.mustache", "", "interfaces.php"));
    //supportingFiles.add(new SupportingFile("controllers.mustache", "", "controllers.php"));

    /**
     * Template Location.  This is the location which templates will be read from.  The generator
     * will use the resource stream to attempt to read the templates.
     */
    templateDir = "slim";

    /**
     * Models.  You can write model files using the modelTemplateFiles map.
     * if you want to create one template for file, you can do so here.
     * for multiple files for model, just put another entry in the `modelTemplateFiles` with
     * a different extension
     */
    modelTemplateFiles.put( "model.mustache", ".sample");

    /**
     * Reserved words.  Override this with reserved words specific to your language
     */
    reservedWords = new HashSet<String> (
      Arrays.asList( "sample1", "sample2")
    );

    /**
     * Additional Properties.  These values can be passed to the templates and
     * are available in models, apis, and supporting files
     */
    additionalProperties.put("apiVersion", apiVersion);


    /**
     * Language Specific Primitives.  These types will not trigger imports by
     * the client generator
     */
    languageSpecificPrimitives = new HashSet<String>(
      Arrays.asList( "Type1", "Type2")
    );
  }

```

And create the two new api files, `controllers` and `interfaces`:

```
C:\Users\alan\Code\swagger-codegen-test2\output\slim\src\main\resources\slim>dir /b
api.mustache
controllers.mustache
interfaces.mustache
```

When I run `run.cmd` again, I get my new generated files:

```
generated-code\slim\src\DefaultApi.api.php
generated-code\slim\src\DefaultApi.controller.php
generated-code\slim\src\DefaultApi.interfaces.php
generated-code\slim\src\Instance.sample
generated-code\slim\src\io
generated-code\slim\src\io\swagger
generated-code\slim\src\io\swagger\client
generated-code\slim\src\io\swagger\client\api
generated-code\slim\src\io\swagger\client\model
```

Useful stuff to know about mustache and handlebar syntax:


## Dealing with commas
https://stackoverflow.com/questions/6114435/in-mustache-templating-is-there-an-elegant-way-of-expressing-a-comma-separated-l

```
{% raw %}static function {{operationIdCamelCase}}( 
    {{#hasPathParams}}{{#pathParams}}{{#comma}},{{/comma}} ${{paramName}}{{/pathParams}}{{/hasPathParams}}) {% endraw %}
```
That does not seem to work with Swagger codegen, for that use:
```
{% raw %} {{#@last}},{{/@last}}{% endraw %}
```
or
```
{% raw %} {{^@last}},{{/@last}}{% endraw %}
```


```
{{hasParams}}
```

Here is an example:
https://github.com/swagger-api/swagger-codegen-generators/blob/master/src/main/resources/handlebars/go/api_doc.mustache

## Adding to a pre-existing codegen project

When adding a new subclass of `DefaultCodegenConfig` to have more than one available command in the single jar, don't forget to add the new entry in the `META-INF` file:

```
net.enterpos.swagger.SlimGenerator
net.enterpos.swagger.SimpleGenerator
net.enterpos.swagger.TypeScriptAngularClientCodegen
```
