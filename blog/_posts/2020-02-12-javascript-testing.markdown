---
layout: post
title: "Javascript testing"
date: 2020-02-12 03:08:00 -0800
categories: web testing software engineering
published: true
description:
---

From personal experience, tests are the best way to prevent software defects. I've been on many teams in the past where a small piece of code is updated and the developer manually opens their browser or Postman to verify that it still works. This approach (manual QA)

There are 3 types of tests:

* Unit tests
* Integration tests
* End-to-End (e2e) tests

# Unit testing
## Karma
Karma is a direct product of the AngularJS team from struggling to test their own framework features with existing tools. As a result of this, they made Karma and have transitioned it to Angular as the default test runner for applications created with the Angular CLI.

Karma is a great tool for unit testing, For the logic of your individual controllers, directives, and services should be run using Karma. Big tests in which you have a running instance of your entire application should be run using Protractor. Protractor is intended to run tests from a user's point of view - if your test could be written down as instructions for a human interacting with your application, it should be an end-to-end test written with Protractor.

Karma also provides you options to replace Jasmine with other testing frameworks such as Mocha and QUnit.

Karma is a test runner tool, it creates a browser instance, run tests to provide the expected results.

The benefit of using Karma is that it can be operated via command line and It refreshes the browser automatically whenever we make even minor changes in our app.

### Selective tests
I discovered that Jasmine allows you to prefix describe and it methods with an f (for focus?). So, fdescribe and fit. If you use either of these, karma will only run the relevant tests. So, to focus the current file, you can just take the top level describe and change it to fdescribe. Works for my purposes.

## Jasmine
Jasmine is a behavior-driven development framework for testing JavaScript code that plays very well with Karma. Similar to Karma, it’s also the recommended testing framework within the Angular documentation as it's setup for you with the Angular CLI. Jasmine is also dependency free and doesn’t require a DOM.

Jasmine is an open-source behavior-driven testing framework crafted by Pivotal Labs. It is installed via Angular CLI and offers the hassle-free testing experience to test an Angular and JavaScript code.

Jasmine provides several valuable functions to write tests. Here are the main Jasmine methods:

* `it()`: Declaration of a particular test
* `describe()`: It’s a suite of tests
* `expect()`: Expect some value in true form

## Examples

A suite:

    // A Jasmine suite
    describe('Adder', () => {

        // A jasmine spec
        it('should be able to add two whole numbers', () => {
            expect(Adder.add(2, 2)).toEqual(4);
        });

    });


## Testing an angular component

    import { async, ComponentFixture, TestBed } from '@angular/core/testing';
    import { PizzaComponent } from './pizza.component';

    describe('PizzaComponent', () => {
        let component: PizzaComponent;
        let fixture: ComponentFixture<PizzaComponent>;

        beforeEach(async(() => {
            // Angular comes with an API for testing testBed that has a method configureTestingModule() for configuring a test module where 
            // we can import other Angular modules, components, pipes, directives, or services.
            // Once our testing module configured we can then instantiate for example the component we want to test.
            TestBed.configureTestingModule({
            declarations: [ PizzaComponent ]
            })
            .compileComponents();
        }));

        beforeEach(() => {
            // So, to test a component we need to create the component's host element in the browser DOM.
            // To do that we use a TestBed method called createComponent().
            // With this fixture, we can access the raw component by calling its property componentInstance 
            // and its HTML reference by using nativeElement.
            fixture = TestBed.createComponent(PizzaComponent);
            component = fixture.componentInstance;  g
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });
    });

## How to mock a provider

When you are testing a compoent and want to mock a service that is provided, use this:

    describe('SomeComponent', () => {
        let component: SomeComponent;
        let fixture: ComponentFixture<SomeComponent>;
        let SomeService : SomeService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
            declarations: [ SomeComponent ],
            imports: [ RouterTestingModule ],
            providers: [ SomeService ]
            })
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(SomeComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
            SomeService = fixture.debugElement.injector.get(SomeService);
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it(`should call the service`, (() => {
            fixture = TestBed.createComponent(SomeComponent);
            component = fixture.debugElement.componentInstance;
            
            let MockedData = {};
            spyOn(SomeService, 'trackEvent');
            
            // Do something in the component that should call the service
            component.doWork();

            // Let's check if the service was called
            expect(SomeService.trackEvent).toHaveBeenCalledWith({ someArgument : "someValue" });
        }));
    });

## Testing a service

    import { SomeService } from './deployment.service';
    import { SomeModel } from '../../core/models/SomeModel.models';
    import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
    import { TestBed, async, inject } from '@angular/core/testing';

    describe('SomeService', () => {
        let postService: SomeService;
        let httpMock: HttpTestingController;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ HttpClientTestingModule ],
                providers: [ SomeService ]
            });
        }));

        it(`should fetch from external endpoint`, (
            inject([HttpTestingController, SomeService],
            (httpMock: HttpTestingController, postService: SomeService) => {

                let res = postService.getSomeData("myRequest").subscribe(result => {
                    expect(result.SomeModelId).toBe("1");
                }, error => {
                    // ...
                });
            
                // We set the expectations for the HttpClient mock
                const req = httpMock.expectOne('https://the_url_that_should_have_been_called/');
                expect(req.request.method).toEqual('GET');

                // Then we set the fake data to be returned by the mock
                let SomeModel = new SomeModel();
                SomeModel.SomeModelId = "1";
                req.flush(SomeModel);
            })));
    });


## Spectator
Spectator helps you get rid of all the boilerplate grunt work, leaving you with readable, sleek and streamlined unit tests.

## Protractor
and Protractor is intended for end-to-end or integration testing
https://www.protractortest.org/#/faq

## Selenium

## webdriver-manager
https://chromedriver.chromium.org/downloads
```
 \node_modules\.bin\webdriver-manager.cmd update --chrome  --versions.chrome 80.0.3987.106
```


* https://angular.io/guide/testing
* https://www.protractortest.org/#/faq
* https://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html
* https://karma-runner.github.io/latest/index.html
* https://www.google.com/search?q=protractor+architecture&rlz=1C1CHBF_enUS816US816&sxsrf=ACYBGNT80W-9svB2p71cumaZu2nfAFsgKQ:1581547935296&source=lnms&tbm=isch&sa=X&ved=2ahUKEwiopIOXjc3nAhVtGjQIHZCoAOsQ_AUoAXoECA4QAw&biw=1920&bih=1099#imgrc=VDePS9bxPiMyrM
* https://www.protractortest.org/#/
* https://jasmine.github.io/tutorials/your_first_suite
* https://dev.to/cathysmith/learn-how-unit-testing-angular-component-with-spectator-13di
* https://itnext.io/testing-angular-applications-with-jest-and-spectator-c05991579807
* https://angular.io/guide/workspace-config
* https://medium.com/@amcdnl/custom-environments-for-angular-cli-4ce0b82da83b
* https://medium.com/@balramchavan/configure-and-build-angular-application-for-different-environments-7e94a3c0af23
* https://angular.io/guide/workspace-config

* https://scotch.io/tutorials/testing-angular-with-jasmine-and-karma-part-1
* https://www.positronx.io/angular-unit-testing-application-with-jasmine-karma/
* https://dev.to/mustapha/angular-unit-testing-101-with-examples-6mc
* https://stackoverflow.com/questions/59140915/mocking-a-service-in-angular-karma-jasmine-testing
* https://stackoverflow.com/questions/59140915/mocking-a-service-in-angular-karma-jasmine-testing
* https://blog.angulartraining.com/how-to-write-unit-tests-for-angular-code-that-uses-the-httpclient-429fa782eb15

* https://codecraft.tv/courses/angular/unit-testing/components/
* https://www.positronx.io/angular-unit-testing-application-with-jasmine-karma/
* https://blog.realworldfullstack.io/real-world-angular-part-9-unit-testing-c62ba20b1d93
* https://blog.angulartraining.com/how-to-write-unit-tests-for-angular-code-that-uses-the-httpclient-429fa782eb15
* https://dev.to/mustapha/angular-unit-testing-101-with-examples-6mc
* https://dev.to/aurelkurtula/unit-testing-with-jasmine-the-very-basics-74k
* https://medium.com/@kristaps.strals/build-and-test-projects-in-azure-devops-pipelines-745abea273b8
* https://code.visualstudio.com/docs/nodejs/angular-tutorial

* https://blog.ninja-squad.com/2016/03/15/ninja-tips-2-type-your-json-with-typescript/

* https://angular.io/guide/dependency-injection-providers

* https://docs.microsoft.com/en-us/rest/api/azure/devops/git/pull%20request%20thread%20comments/create?view=azure-devops-rest-5.1

https://stackoverflow.com/questions/41132933/running-a-single-test-file


https://gist.github.com/julekgwa/28ecfc93f3998b4302e2653bf43ac4ed#working-with-locators