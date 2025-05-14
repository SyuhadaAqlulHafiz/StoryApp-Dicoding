import { storyMapper } from '../../data/api-mapper.js';

export default class BookmarkPresenter {
    #view;
    #model;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async showBookmarkPage() {
        this.#view.showLoading();

        try {
            const listStory = await this.#model.getAllStory();
    
            const message = 'Berhasil mendapatkan daftar laporan tersimpan.';

            this.#view.populateSaveStoryList(message, listStory);
        } catch(error) {
            console.error('showSaveStoryList: error: ', error);
            this.#view.populateSaveStoryError(error.message);
        } finally {
            this.#view.hideLoading();
        }
    }
}