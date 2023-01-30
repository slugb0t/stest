"use strict";
import { pass } from "./nothing.js";
import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info("Yay, the app was loaded!");

  // On opening a new issue
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Hello! Thank you for opening this issue. Your input is valuable and helps improve the project. Can you please provide a detailed description of the problem you're encountering? Any additional information such as steps to reproduce the issue would be greatly appreciated. Thank you!",
    });

    axios.post(SLACK_WEBHOOK_URL, {
      text: `New issue opened by ${context.payload.issue.user.login} in ${context.payload.repository.full_name}`,
    });

    return context.octokit.issues.createComment(issueComment);
  });

  // On closing an issue
  app.on("issues.closed", async (context) => {
    const issueComment = context.issue({
      body: "Thank you for bringing this issue to our attention. After a thorough investigation, we have determined that this issue has been resolved. If you're still experiencing any problems, please don't hesitate to open a new issue. Have a great day!",
    });

    return context.octokit.issues.createComment(issueComment);
  });

  // On opening a new pull request
  app.on("pull_request.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thank you for submitting this pull request! We appreciate your contribution to the project. Before we can merge it, we need to review the changes you've made to ensure they align with our code standards and meet the requirements of the project. We'll get back to you as soon as we can with feedback. Thanks again!",
    });

    return context.octokit.issues.createComment(issueComment);
  });

  // On closing a pull request
  app.on("pull_request.closed", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for closing this pull request! If you have any further questions, please feel free to open a new issue. We are always happy to help!",
    });

    return context.octokit.issues.createComment(issueComment);
  });

  // On editing a pull request
  app.on("pull_request.edited", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for making updates to your pull request. Our team will take a look and provide feedback as soon as possible. Please wait for any GitHub Actions to complete before editing your pull request. If you have any additional questions or concerns, feel free to let us know. Thank you for your contributions!",
    });

    return context.octokit.issues.createComment(issueComment);
  });

  app.on("pull_request.ready_for_review", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for making your pull request ready for review! Our team will take a look and provide feedback as soon as possible.",
    });

    axios.post(SLACK_WEBHOOK_URL, {
      text: `New pull request opened by ${context.payload.pull_request.user.login} in ${context.payload.repository.full_name}`,
    });

    return context.octokit.issues.createComment(issueComment);
  });

  // On repo being starred
  app.on("star.created", async (context) => {
    const owner = context.payload.repository.owner.login;
    const repoName = context.payload.repository.name;

    axios.post(SLACK_WEBHOOK_URL, {
      text: `New star created by ${context.payload.sender.login} in ${context.payload.repository.full_name}`,
    });

    return;
  });

  // On repo being unstarred
  app.on("star.deleted", async (context) => {
    axios.post(SLACK_WEBHOOK_URL, {
      text: `Star deleted by ${context.payload.sender.login} in ${context.payload.repository.full_name}`,
    });

    return;
  });

  // On creating a new fork
  app.on("fork", async (context) => {
    axios.post(SLACK_WEBHOOK_URL, {
      text: `New fork created by ${context.payload.forkee.owner.login} of ${context.payload.repository.full_name}`,
    });

    return;
  });

  // On adding a label to an issue
  app.on("label.created", async (context) => {
    let issueComment = "";

    // Get the label name
    const labelName = context.payload.label.name;

    if (labelName === "bug" || labelName === "needs-more-info") {
      issueComment = context.issue({
        body: "We appreciate your contribution to the project. Can you please provide more details, such as steps to reproduce the problem, and any relevant information to help us understand the issue better? This will help us in resolving the issue as soon as possible.",
      });
    } else if (labelName === "enhancement") {
      issueComment = context.issue({
        body: "We appreciate your contribution to the project. Can you please provide more details, such as the use case for the enhancement, and any relevant information to help us understand the issue better? This will help us in resolving the issue as soon as possible.",
      });
    } else {
      return;
    }

    return context.octokit.issues.createComment(issueComment);
  });

  // On adding app to the account
  app.on("installation.created", async (context) => {
    const owner = context.payload.installation.account.login;

    for (const repo of context.payload.repositories) {
      const repoName = repo.name;

      axios.post(SLACK_WEBHOOK_URL, {
        text: `New installation created by ${owner} in ${repoName}`,
      });

      pass();
    }
  });

  // On adding adding a repository to the app
  app.on("installation_repositories.added", async (context) => {
    const owner = context.payload.installation.account.login;

    for (const repo of context.payload.repositories_added) {
      const repoName = repo.name;

      axios.post(SLACK_WEBHOOK_URL, {
        text: `New repository added by ${owner} in ${repoName}`,
      });

      pass();
    }
  });

  // on creating a new repository
  app.on("repository.created", async (context) => {
    const owner = context.payload.repository.owner.login;
    const repoName = context.payload.repository.name;

    axios.post(SLACK_WEBHOOK_URL, {
      text: `New repository created by ${owner} in ${repoName}`,
    });

    pass();
  });

  // on commiting to the master branch
  app.on("push", async (context) => {
    pass();
  });
};
