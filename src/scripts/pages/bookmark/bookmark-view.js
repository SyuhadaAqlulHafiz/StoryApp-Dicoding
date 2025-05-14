import {
    generateLoaderAbsoluteTemplate,
    generateStoryListTemplate,
    generateStoryListEmptyTemplate,
    generateStoryListErrorTemplate,
} from '../../template.js';
import BookmarkPresenter from './bookmark-presenter.js';
import Database from '../../data/database.js';

export default class BookmarkPage {
    #presenter = null;

    async render() {
        return `

            <section class="container">
                <h1 class="section-title">Daftar Catatan Tersimpan</h1>
                <div class="story-list__container">
                    <div id="story-list"></div>
                    <div id="story-list-loading-container"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new BookmarkPresenter({
            view: this,
            model: Database,
        });

        await this.#presenter.showBookmarkPage();

    }

    populateSaveStoryList(message, data) {
        if (data.length <= 0) {
            this.populateSaveStoryEmpty();
            return;
        }

        const html = data.reduce((accumulator, storyList) => {
        return accumulator.concat(
            generateStoryListTemplate({
            id: storyList.id,
            name: storyList.name,
            description: storyList.description,
            photoUrl: storyList.photoUrl,
            createdAt: storyList.createdAt,
            location: { latitude: storyList.lat, longitude: storyList.lon },
            })
        );
        }, '');

        document.getElementById('story-list').innerHTML = `
            <div class="story-list">${html}</div>
        `;
    }

    populateSaveStoryEmpty() {
        document.getElementById('story-list').innerHTML = generateStoryListEmptyTemplate();
    }

    populateSaveStoryError() {
        document.getElementById('story-list').innerHTML = generateStoryListErrorTemplate();
    }

    showLoading() {
        document.getElementById('story-list-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }

    hideLoading() {
        document.getElementById('story-list-loading-container').innerHTML = '';
    }
}