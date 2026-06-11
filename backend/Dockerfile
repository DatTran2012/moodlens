FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore MoodLens.API/MoodLens.API.csproj

RUN dotnet publish MoodLens.API/MoodLens.API.csproj \
-c Release \
-o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "MoodLens.API.dll"]