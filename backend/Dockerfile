FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Sigei.sln ./
COPY src/Sigei.Domain/Sigei.Domain.csproj src/Sigei.Domain/
COPY src/Sigei.Application/Sigei.Application.csproj src/Sigei.Application/
COPY src/Sigei.Infrastructure/Sigei.Infrastructure.csproj src/Sigei.Infrastructure/
COPY src/Sigei.WebApi/Sigei.WebApi.csproj src/Sigei.WebApi/
COPY tests/Sigei.UnitTests/Sigei.UnitTests.csproj tests/Sigei.UnitTests/

RUN dotnet restore Sigei.sln

COPY . .
RUN dotnet publish src/Sigei.WebApi/Sigei.WebApi.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=build /app/publish .

USER $APP_UID
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Sigei.WebApi.dll"]
