const PostService = {
  BASE_URL: "https://jsonplaceholder.typicode.com",

  /**
   * @returns {Promise<Array>}
   */
  async getPosts() {
    const response = await fetch(`${this.BASE_URL}/posts`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  /**
   * @returns {Promise<Array>}
   */
  async getUsers() {
    const response = await fetch(`${this.BASE_URL}/users`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  /**
   * @param {number} postId
   * @returns {Promise<Array>}
   */
  async getComments(postId) {
    const response = await fetch(`${this.BASE_URL}/posts/${postId}/comments`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

const $ = (sel) => document.querySelector(sel);

const postsGrid = $("#postsGrid");
const loader = $("#loader");
const errorState = $("#errorState");
const errorText = $("#errorText");
const emptyState = $("#emptyState");
const retryBtn = $("#retryBtn");
const searchInput = $("#searchInput");
const postCount = $("#postCount");

const modalOverlay = $("#modalOverlay");
const modalClose = $("#modalClose");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");
const modalUser = $("#modalUser");
const commentsLoader = $("#commentsLoader");
const commentsList = $("#commentsList");

let allPosts = [];
let userMap = {};

/**
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * @param {number} userId 
 * @returns {string} 
 */
function getColorForUser(userId) {
  const colors = [
    "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    "linear-gradient(135deg, #00cec9, #55efc4)",
    "linear-gradient(135deg, #fd79a8, #e84393)",
    "linear-gradient(135deg, #fdcb6e, #f39c12)",
    "linear-gradient(135deg, #74b9ff, #0984e3)",
    "linear-gradient(135deg, #ff7675, #d63031)",
    "linear-gradient(135deg, #55efc4, #00b894)",
    "linear-gradient(135deg, #dfe6e9, #b2bec3)",
    "linear-gradient(135deg, #fab1a0, #e17055)",
    "linear-gradient(135deg, #81ecec, #00cec9)",
  ];

  return colors[(userId - 1) % colors.length];
}



/**
 */
function showLoader() {
  loader.style.display = "flex";
  errorState.style.display = "none";
  emptyState.style.display = "none";
  postsGrid.innerHTML = "";
}

/**
 *
 */
function hideLoader() {
  loader.style.display = "none";
}

/**
 * @param {string} message
 */
function showError(message) {
  hideLoader();
  errorText.textContent = message;
  errorState.style.display = "block";
}

function showEmpty() {
  hideLoader();
  emptyState.style.display = "block";
}

function hideEmpty() {
  emptyState.style.display = "none";
}

/**
 * @param {Object} post
 * @returns {HTMLElement}
 */
function createPostCard(post) {
  const user = usersMap[post.userId] || {
    name: `Istifadeci ${post.userId}`,
  };

  const initials = getInitials(user.name);
  const avatarBg = getColorForUser(post.userId);

  const card = document.createElement("div");
  card.className = "post-card";
  card.style.animationDelay = `${(post._index || 0) * 0.05}s`;

  card.innerHTML = `
    <div class="post-card__user">
      <span class="post-card__user-avatar" style="background: ${avatarBg}">
        ${initials}
      </span>
      ${user.name}
    </div>
    <h2 class="post-card__title">${post.title}</h2>
    <p class="post-card__excerpt">${post.body}</p>
    <div class="post-card__footer">
      <span class="post-card__id">#${post.id}</span>
      <span class="post-card__read">Ətraflı</span>
    </div>
  `;

  card.addEventListener("click", () => openModal(post));
  return card;
}

/**
 * @param {Array} posts
 */
function renderPosts(posts) {
  postsGrid.innerHTML = "";
  hideEmpty();

  if (posts.length === 0) {
    showEmpty();
    postCount.textContent = "0 post";
    return;
  }

  postCount.textContent = `${posts.length} post`;

  posts.forEach((post, i) => {
    post._index = i;
    postsGrid.appendChild(createPostCard(post));
  });
}

/**
 * @param {Object} post
 */
function openModal(post) {
  const user = usersMap[post.userId] || {
    name: `Isdifadeci ${post.userId}`,
  };

  modalUser.textContent = `${user.name}`;
  modalTitle.textContent = post.title;
  modalBody.textContent = post.body;

  commentsList.innerHTML = "";
  commentsLoader.style.display = "flex";

  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";

  loadComments(post.id);
}

function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

/**
 * @param {number} postId
 */
async function loadComments(postId) {
  try {
    const comments = await PostService.getComments(postId);
    commentsLoader.style.display = "none";

    if (comments.length === 0) {
      commentsList.innerHTML =
        '<p style="color:var(--text-muted);font-size:0.85rem">Serh yoxdur</p>';
      return;
    }

    commentsList.innerHTML = comments
      .map((c) => {
        const initials = getInitials(c.name);
        return `
          <div class="comment-card">
            <div class="comment-card__header">
              <span class="comment-card__avatar">${initials}</span>
              <div class="comment-card__meta">
                <div class="comment-card__name">${c.name}</div>
                <div class="comment-card__email">${c.email}</div>
              </div>
            </div>
            <p class="comment-card__body">${c.body}</p>
          </div>
        `;
      })
      .join("");
  } catch {
    commentsLoader.style.display = "none";
    commentsList.innerHTML =
      '<p style="color:var(--danger);font-size:0.85rem">Serhler yuklene bilmedi</p>';
  }
}

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderPosts(allPosts);
    return;
  }

  const filtered = allPosts.filter((post) => {
    const userName = (userMap[post.userId]?.name || "").toLowerCase();

    return (
      post.title.toLowerCase().includes(query) ||
      post.body.toLowerCase().includes(query) ||
      userName.includes(query)
    );
  });

  renderPosts(filtered);
}

async function init() {
  showLoader();

  try {
    const [posts, users] = await Promise.all([
      PostService.getPosts(),
      PostService.getUsers(),
    ]);

    users.forEach((u) => (usersMap[u.id] = u));
    allPosts = posts;

    hideLoader();
    renderPosts(allPosts);
  } catch (err) {
    showError(`Postlar yuklemek mumkun olmadi: ${err.message}`);
  }
}

searchInput.addEventListener("input", handleSearch);
retryBtn.addEventListener("click", init);
modalClose.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

init();
