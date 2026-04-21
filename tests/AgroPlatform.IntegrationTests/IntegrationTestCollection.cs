namespace AgroPlatform.IntegrationTests;

[CollectionDefinition("Integration Tests")]
public class IntegrationTestCollection : ICollectionFixture<CustomWebApplicationFactory<Program>>
{
}
