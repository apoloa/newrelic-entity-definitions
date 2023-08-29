const {Octokit} = require("@octokit/rest");

class GithubHelper {

    static GH_PR_EVENT_APPROVE = "APPROVE";
    static GH_PR_EVENT_REQUEST_CHANGES = "REQUEST_CHANGES";
    static GH_PR_EVENT_COMMENT = "COMMENT";

    static VALID_GH_PR_EVENTS = [this.GH_PR_EVENT_APPROVE, this.GH_PR_EVENT_COMMENT, this.GH_PR_EVENT_PENDING, this.GH_PR_EVENT_REQUEST_CHANGES]

    constructor() {
        this.githubOwner = null;
        this.githubRepository = null;
        if (process.env.GITHUB_REPOSITORY) {
            const githubOwnerRepo = process.env.GITHUB_REPOSITORY;
            const githubParts = githubOwnerRepo.split("/");
            this.githubOwner = githubParts[0];
            this.githubRepository = githubParts[1];
        }
        this.prNumber = null;
        if (process.env.PR_NUMBER) {
            this.prNumber = process.env.PR_NUMBER;
        }
        this.octokit = null;
        if (process.env.GITHUB_TOKEN) {
            let githubToken = process.env.GITHUB_TOKEN;
            this.octokit = new Octokit({
                auth: githubToken
            });
        }

        this.enabled = !(this.githubRepository == null || this.prNumber == null || this.octokit == null);
    }

    async createReviewPR(body, event) {
        if (!this.enabled) {
            return Promise.resolve();
        }
        let prEvent = event
        if (!GithubHelper.VALID_GH_PR_EVENTS.includes(event)) {
            prEvent = GithubHelper.GH_PR_EVENT_COMMENT;
        }
        try {
            console.log("Doing request to Github API with the following data:")
            await this.octokit.pulls.createReview({
                owner: this.githubOwner,
                repo: this.githubRepository,
                pull_number: this.prNumber,
                body: body,
                event: prEvent
            });
        } catch (error) {
            console.error("Error to create the message:", error);
        }
    }
}
console.log(process.env)
module.exports = new GithubHelper();
