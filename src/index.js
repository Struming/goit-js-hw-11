import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const apiKey = '16653894-0ab9bd64880b7f862879404f4';
let currentPage = 1;
let searchQuery = '';
let totalHits = 0;
const imagesPerPage = 40;
let scrolledImages = 0;

const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.style.display = 'none';

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

const gallery = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a');

document.getElementById('search-form').addEventListener('submit', function(event) {
  event.preventDefault();

  searchQuery = document.getElementsByName('searchQuery')[0].value;
  currentPage = 1;
  scrolledImages = 0;

  searchImages();
  clearGallery();
  hideLoadMoreButton();
});

function searchImages() {
  axios
    .get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: imagesPerPage
      }
    })
    .then(function(response) {
      const images = response.data.hits;
      totalHits = response.data.totalHits;

      if (images.length > 0) {
        displayImages(images);
        scrolledImages += images.length;
      } else {
        showNoImagesMessage();
      }

      if (scrolledImages >= imagesPerPage && scrolledImages < totalHits) {
        showLoadMoreButton();
      } else {
        hideLoadMoreButton();
      }

      if (scrolledImages >= totalHits) {
        hideLoadMoreButton();
        if (totalHits > 0) {
          showEndOfResultsMessage();
        }
      }

      showTotalHitsMessage(totalHits);
      lightbox.refresh();
      scrollToNextGroup();
      displayPaginationButtons();
    })
    .catch(function(error) {
      console.error(error);
    });
}

function scrollToNextGroup() {
  const cardHeight = gallery.firstElementChild.getBoundingClientRect().height;
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth'
  });
}

function loadMoreImages() {
  currentPage++;
  searchImages();
}

function clearGallery() {
  gallery.innerHTML = '';
}

function displayImages(images) {
  images.forEach(function(image) {
    const card = createImageCard(image);
    gallery.appendChild(card);
  });
}

function createImageCard(image) {
  const card = document.createElement('a');
  card.href = image.webformatURL;
  card.classList.add('photo-card');

  const imageElement = document.createElement('img');
  imageElement.src = image.webformatURL;
  imageElement.alt = image.tags;
  imageElement.loading = 'lazy';

  card.appendChild(imageElement);

  const infoElement = document.createElement('div');
  infoElement.classList.add('info');

  const likesElement = createInfoItem('Likes', image.likes);
  const viewsElement = createInfoItem('Views', image.views);
  const commentsElement = createInfoItem('Comments', image.comments);
  const downloadsElement = createInfoItem('Downloads', image.downloads);

infoElement.appendChild(likesElement);
infoElement.appendChild(viewsElement);
infoElement.appendChild(commentsElement);
infoElement.appendChild(downloadsElement);

card.appendChild(infoElement);

return card;
}

function createInfoItem(label, value) {
  const itemElement = document.createElement('p');
  itemElement.classList.add('info-item');
  itemElement.innerHTML = `<b>${label}</b>: ${value}`;
  return itemElement;
}

function showTotalHitsMessage(totalHits) {
  Notiflix.Notify.info(`Total hits: ${totalHits}`, {});
}

function handlePaginationClick(event) {
  event.preventDefault();
  currentPage = parseInt(event.target.dataset.page);
  searchImages();
}

function createPaginationButton(page) {
  const button = document.createElement('button');
  button.classList.add('pagination-button');
  button.innerText = page;
  button.dataset.page = page;
  button.addEventListener('click', handlePaginationClick);
  return button;
}

function showEndOfResultsMessage() {
  Notiflix.Notify.info('End of results.', {
    position: 'right-top',
    timeout: 3000
  });
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

loadMoreButton.addEventListener('click', loadMoreImages);

function showNoImagesMessage() {
  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}
