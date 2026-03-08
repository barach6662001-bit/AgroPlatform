# Stage 1 – build & publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /repo

# Copy solution and project files first for layer caching
COPY AgroPlatform.slnx ./
COPY src/AgroPlatform.Api/AgroPlatform.Api.csproj                         src/AgroPlatform.Api/
COPY src/AgroPlatform.Application/AgroPlatform.Application.csproj         src/AgroPlatform.Application/
COPY src/AgroPlatform.Domain/AgroPlatform.Domain.csproj                   src/AgroPlatform.Domain/
COPY src/AgroPlatform.Infrastructure/AgroPlatform.Infrastructure.csproj   src/AgroPlatform.Infrastructure/

RUN dotnet restore src/AgroPlatform.Api/AgroPlatform.Api.csproj

# Copy remaining source and publish
COPY src/ src/
RUN dotnet publish src/AgroPlatform.Api/AgroPlatform.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

# Stage 2 – minimal runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

RUN mkdir -p /app/logs

ENTRYPOINT ["dotnet", "AgroPlatform.Api.dll"]
