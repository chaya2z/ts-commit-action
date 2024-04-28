import { Octokit } from "https://esm.sh/octokit?dts";

const main = async () => {
  const owner = "chaya2z";
  const repo = "ts-commit-action";

  // authentication
  const octokit = new Octokit({
    auth: Deno.env.get("GITHUB_TOKEN"),
  });

  // for debugging
  const { data: { login } } = await octokit.rest.users.getAuthenticated();
  console.log("Hello, %s", login);

  const { data: { object: { sha: base_commit_sha } } } = await octokit.rest.git
    .getRef({
      owner,
      repo,
      ref: "heads/main",
    });

  const { data: { tree: { sha: base_tree_sha } } } = await octokit.rest.git
    .getCommit({
      owner,
      repo,
      commit_sha: base_commit_sha,
    });

  // create tree
  const { data: { sha: tree_sha } } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: base_tree_sha,
    tree: [
      {
        path: "test.txt",
        mode: "100644",
        content: "test content 04/28 12:00",
      },
    ],
  });
  console.log("Tree was created", tree_sha);

  // commit
  const { data: { sha }, status } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: "Hello World!",
    tree: tree_sha,
    parents: [
      base_commit_sha,
    ],
  });
  if (status === 201) {
    console.log("Commit: %s", sha);
  }

  // push
  const { data } = await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: "heads/main",
    sha,
  });
  console.log(data);
  console.log("success");
};

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  main();
}
