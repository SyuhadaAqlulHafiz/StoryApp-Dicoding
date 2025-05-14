import { storyMapper } from "../../data/api-mapper.js";

export default class DetailPresenter {
    #detailId;
    #view;
    #model;
    #dbModel;

    constructor(detailId, { view, model, dbModel }) {
        this.#detailId = detailId;
        this.#view = view;
        this.#model = model;
        this.#dbModel = dbModel;
    }

    async showDetailMap() {
        this.#view.showMapLoading();

        try {
            await this.#view.initialMap();
        } catch (error) {
            console.error('showDetailMap: error: ',error);
        } finally {
            this.#view.hideMapLoading();
        }
    }

    async showDetail() {
        this.#view.showDetailLoading();

        try {
            const response = await this.#model.getDetailStory(this.#detailId);

            if (!response.ok) {
                this.#view.populateDetailError(response.message);
                return;
            }

            const detail = await storyMapper(response.story);

            this.#view.populateDetailStory(response.message, detail);
        } catch(error) {
            console.error('showDetail: error: ',error);
            this.#view.populateDetailError(error.message);
        } finally {
            this.#view.hideDetailLoading();
        }
    }

    async saveStory() {
        try {
            const story = await this.#model.getDetailStory(this.#detailId);
            await this.#dbModel.putStory(story.story);

            this.#view.saveStorySuccessfull('Success to save to bookmark');
        } catch (error) {
            console.error('saveStory: error:', error);
            this.#view.saveStoryFail(error.message);
        }
    }

    async removeStory() {
        try {
            await this.#dbModel.removeStory(this.#detailId);

            this.#view.removeStorySuccessfull('Succes to remove from bookmark');
        } catch (error) {
            console.error('removeStory: error: ',error);
            this.#view.removeStoryFail(error.message);
        }
    }

    async showSaveButton() {
    if (await this.#isReportSaved()) {
        this.#view.renderRemoveButton();
            return;
        }
    
        this.#view.renderSaveButton();
    }

    async #isReportSaved() {
        return !!(await this.#dbModel.getDetailStory(this.#detailId));
    }
}