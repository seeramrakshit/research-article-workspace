/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "article-review-workspace",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },

  async run() {
    const databaseUrl = new sst.Secret("DatabaseUrl");
    const authSecret = new sst.Secret("AuthSecret");

    const web = new sst.aws.Nextjs("ArticleReviewWeb", {
      link: [databaseUrl, authSecret],

      environment: {
        DATABASE_URL: databaseUrl.value,
        AUTH_SECRET: authSecret.value,
      },
    });

    return {
      url: web.url,
    };
  },
});