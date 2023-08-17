"use strict";

import { Octokit } from "https://esm.sh/@octokit/core";

const octokit = new Octokit({
    auth: "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"
});

class Github {
    constructor() {
        this.clientId = "7638f5c51bdce2f0afde";
        this.clientSecret = "edda3b8f244e07cb4e0fc0a7bdc0903e13bd3bb4";
    }

    async getUser(userName) {
        const data = await fetch(`https://api.github.com/users/${userName}?client_id=${this.clientId}&client_secret=${this.clientSecret}`);
        return await data.json();
    }

    async getUserRepositories(userName) {
        return await octokit.request(`GET /users/${userName}/repos`, {
            username: userName,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
        })
    }
}

class UI {
    constructor() {
        this.profile = document.querySelector(".profile");
    }

    showProfile(user, repositories) {
        this.profile.innerHTML = `<div class="card card-body mb-3">
        <div class="row">
          <div class="col-md-3">
            <img class="img-fluid mb-2" src="${user.avatar_url}" alt="avatar">
            <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
          </div>
          <div class="col-md-9">
            <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
            <span class="badge badge-secondary">Public Gists: ${user.public_gists}</span>
            <span class="badge badge-success">Followers: ${user.followers}</span>
            <span class="badge badge-info">Following: ${user.following}</span>
            <br><br>
            <ul class="list-group">
              <li class="list-group-item">Company: ${user.company}</li>
              <li class="list-group-item">Website/Blog: ${user.blog}</li>
              <li class="list-group-item">Location: ${user.location}</li>
              <li class="list-group-item">Member Since: ${user.created_at}</li>
            </ul>
          </div>
        </div>
      </div>
      <h3 class="page-heading mb-3">Latest Repos</h3>
        <div class="repos card card-body mb-3">
            <ul class="list-group">
            </ul>
        </div>`
      this.#showRepositories(repositories);
    }

    #showRepositories(repositories) {
        const repos = document.querySelector(".repos .list-group");

        for (let i = 0; i <= (repositories.length >= 5 ? 4 : repositories.length - 1); i++) {
            const li = document.createElement("li");
            li.classList.add("list-group-item", "w-100");
            li.innerHTML = `<span class="d-block fs-4">Repository Name: ${repositories[i].name}</span>
            <span class="d-block fs-4">Repository Description: ${repositories[i].description}</span>
            <a href="${repositories[i].html_url}" target="_blank" class="btn btn-primary btn-block mt-2">View Repository</a>`;
            repos.appendChild(li);
        }
    }

    showError(message) {
        const div = document.createElement("div");
        div.classList.add("alert", "alert-danger");
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector(".searchContainer");
        const search = document.querySelector(".search");

        container.insertBefore(div, search);

        setTimeout(() => {
            div.remove();
        }, 3000);
    }
}

const github = new Github();
const ui = new UI();
const searchUser = document.querySelector(".searchUser");
let delayedRequest;

searchUser.addEventListener("keyup", (event) => {
    const userText = event.target.value;

    if(userText.trim() !== ""){
        if(delayedRequest) {
            clearTimeout(delayedRequest);
        }

        delayedRequest = setTimeout(() => {
            github.getUser(userText)
            .then((userData) => {
                if(userData.message === "Not Found") {
                    ui.showError(userData.message);
                } else {
                    github.getUserRepositories(userText)
                    .then((repositoriesData) => {
                        ui.showProfile(userData, repositoriesData.data);
                    })
                    .catch((error) => ui.showError(error))
                }
            })
        }, 500);
    }
}) 