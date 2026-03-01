const PostService = {
    BASE_URL: 'https://jsonplaceholder.typicode.com',
    /**
     * @returns {Promise<Array<Array>}
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
     * @param{number} postId
     * @returns{Promise<Array>}
     */

    async getComments(postId) {
        const response = await fetch(`${this.BASE_URL}/posts/${postId}/comments`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    },
};

const $ = (sel) => document.querySelector(sel);

const postsGrid = $('#postsGrid');
const loader = $('#loader');
const errorState = $('#errorState');
const errorText = $('#errorText');
const emptyState = $('#emptyState');
const retryBtn = $('#retryBtn');
const searchInput = $('#searchInput');
const postCount = $('#postCount');

function showLoader() {
    loader.style.display = 'flex';
    errorState.style.display = 'none';
    emptyState.style.display = 'none';
    postsGrid.innerHTML = '';
}
function hideLoader() {
    loader.style.display = 'none';

}
/**
 * @param{srting} message
 */
function showError(message) {
    hideLoader();
    errorText.textContent = message;
    errorState.style.display = 'block';
}
function showEmpty() {
    hideLoader();
    emptyState.style.display = 'block';
}
function hideEmpty() {
    emptyState.style.display = 'none';
}
/**
 * @param {Object} post -
 * @returns{HTMLElement} -
 */
function createPostCard(post) {
    const user = usersMap[post.userId] || {
    name: `Istifadeci ${post.userId}`
    }
};
const initials = getInitals(user.name);
const avatarBg = getColorForUser(post.userId);

const card = document.createElement('div');
card.className = 'post-card';
card.style.animationDelay = `${(post._index || 0) *0.05}s`;
card.innerHTML = `
<div class = "post-card__user">
<span class="post-card__user-avatar" style="background: ${avatarBg}">${initials}</span>
${user.name}
</div>
<h2 class="post-card__title">${post.title}</h2>
<p class="post-card__excerpt">${post.body}</p>
<div class="post-card__footer">
<span class="post-card__id">#${post.id}</span>
<span class="post-card__read">Ətraflı</span>
</div>
`;
card.addEventListener('click',()=> openModal(post));
return card;
