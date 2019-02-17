---
layout: post
title: "Mocking MVC user identity with moq"
date: 2019-02-17 10:27:00 -0800
categories: mocking-mvc-user-identity-with-moq
---

I needed to run unit tests and the User.Identity needed to be mocked, but some of the methods being called are extension methods, like `GetUserId` defined in `Microsoft.AspNet.Identity.Core.dll`.


    namespace Microsoft.AspNet.Identity
    {
        public static class IdentityExtensions
        {
            public static string FindFirstValue(this ClaimsIdentity identity, string claimType);
            public static T GetUserId<T>(this IIdentity identity) where T : IConvertible;
            public static string GetUserId(this IIdentity identity);
            public static string GetUserName(this IIdentity identity);
        }
    }

I learned that Moq can't really mock extension methods because <explanation>.

Using SpyIL we were able to decompile `Microsoft.AspNet.Identity.Core.dll` and saw that ...


etc... until it wokred.

Fake it:

    using (var fake = new FakeHttpContext.FakeHttpContext())
    {
        OrganizationClassController organizationClassController = new OrganizationClassController(/* ... */);

        var data = new Dictionary<string, object>()
        {
            {"a", "b"} // fake whatever  you need here.
        };

        var identityMock = new Mock<ClaimsIdentity>();
        identityMock.Setup(p => p.FindFirst(It.IsAny<string>())).Returns(new Claim("foo", "someid"));

        var userMock = new Mock<IPrincipal>();
        userMock.Setup(p => p.IsInRole("Organization")).Returns(true);
        userMock.SetupGet(p => p.Identity).Returns(identityMock.Object);

        var userMock3 = userMock.Object.Identity;
        var asldkfj = userMock3.GetUserId();

        var contextMock = new Mock<HttpContextBase>();
        contextMock.SetupGet(ctx => ctx.User)
                   .Returns(userMock.Object);

        var controllerContextMock = new Mock<System.Web.Mvc.ControllerContext>();
        controllerContextMock.SetupGet(con => con.HttpContext)
                             .Returns(contextMock.Object);

        organizationClassController.ControllerContext = controllerContextMock.Object;

        HttpContext.Current.Items.Add("owin.Environment", data);

        var task = organizationClassController.SaveClass(organizationClass);
        task.Wait();

    }

Use it:

    string userId = User.Identity.GetUserId();

In an extension method:

        public static bool IsOrganization(this IPrincipal principal)
        {
            return principal.IsInRole(Role.Organization);
        }


Notes:
http://adventuresdotnet.blogspot.com/2011/03/mocking-static-methods-for-unit-testing.html
http://unittesting1.blogspot.com/2016/07/how-to-mock-owincontext-for-mvc-5.html
https://blog.jcorioland.io/archives/2014/04/01/using-owin-to-test-your-web-api-controllers.html
https://docs.microsoft.com/en-us/previous-versions/aspnet/mt174927(v=vs.118)
https://github.com/Shazwazza/UmbracoIdentity/issues/46
https://stackoverflow.com/questions/21768767/why-am-i-getting-an-exception-with-the-message-invalid-setup-on-a-non-virtual
https://stackoverflow.com/questions/2295960/mocking-extension-methods-with-moq
https://stackoverflow.com/questions/24836845/request-getowincontext-returns-null-within-unit-test-how-do-i-test-owin-authen
https://stackoverflow.com/questions/26347582/httpcontext-getowincontext-getusermanagerapprolemanager-return-null
https://stackoverflow.com/questions/29759672/asp-net-mvc-no-owin-environment-item-was-found-in-the-context
https://stackoverflow.com/questions/38170467/httpcontext-current-is-null-when-unit-test
https://stackoverflow.com/questions/4379450/mock-httpcontext-current-in-test-init-method
https://stackoverflow.com/questions/47014168/mock-session-object-with-custom-extension-method
https://stackoverflow.com/questions/758066/how-to-mock-controller-user-using-moq
