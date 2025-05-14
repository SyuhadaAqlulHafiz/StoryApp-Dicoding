import DetailPresenter from "./detail-presenter.js";
import * as Model from "../../data/api.js";
import Map from "../../utils/map.js";
import { parseActivePathname } from "../../routes/url-parser.js";
import {
    generateLoaderAbsoluteTemplate,
    generateDetailErrorTemplate,
    generateDetailTemplate,
    generateSaveStoryButtonTemplate,
    generateRemoveStoryButtonTemplate,
} from "../../template.js";
import Database from '../../data/database.js';
import Swal from "sweetalert2";

export default class DetailPage {
    #presenter = null;
    #map = null;

    async render() {
        return `
            <section>
                <div class="story-detail__container">
                    <div id="story-detail" class="story-detail"></div>
                    <div id="story-detail-loading-container"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new DetailPresenter(parseActivePathname().id, {
            view: this,
            model: Model,
            dbModel: Database,
        });

        this.#presenter.showDetail();
    }

    async populateDetailStory(message, data) {
        document.getElementById('story-detail').innerHTML = 
        generateDetailTemplate({
            img: data.photoUrl,
            creatorName: data.name,
            description: data.description,
            location: data.location,
            createdAt: data.createdAt,
        });

        if (data.location.latitude !== null && data.location.longitude !== null) {
            try {
                await this.#presenter.showDetailMap();

                if (this.#map) {
                    const coor = [data.location.latitude, data.location.longitude];
                    const markerOption = { alt: data.description };
                    const popupOption = { content: data.description };

                    this.#map.changeCamera(coor);
                    this.#map.addMarker(coor, markerOption, popupOption);
                }

                this.#presenter.showSaveButton();
            } catch(error) {
                alert('Terjadi kesalahan!');
            } 
        } else {
            alert('Story ini tidak memiliki lokasi');
        }
    }

    async initialMap() {
        this.#map = await Map.build('#map', {
            zoom: 15,
        });
    }
    
    renderSaveButton() {
        document.getElementById('save-actions-container').innerHTML = generateSaveStoryButtonTemplate();

        document.getElementById('story-detail-save').addEventListener('click', async () => {
            await this.#presenter.saveStory();
            await this.#presenter.showSaveButton();
        });
    }

    saveStorySuccessfull(message) {
        Swal.fire({
            title: 'Catatan berhasil disimpan!',
            icon: 'success',
            text: `${message}`,
            showConfirmButton: false,
            timer: 1500,
        });
    }

    saveStoryFail(message) {
        alert(message);
    }

    renderRemoveButton() {
        document.getElementById('save-actions-container').innerHTML = generateRemoveStoryButtonTemplate();

        document.getElementById('story-detail-remove').addEventListener('click', async () => {
            await this.#presenter.removeStory();
            await this.#presenter.showSaveButton();
        });
    }

    removeStorySuccessfull(message) {
        Swal.fire({
            title: 'Catatan berhasil dihapus!',
            icon: 'success',
            text: `${message}`,
            showConfirmButton: false,
            timer: 1500,
        });
    }

    removeStoryFail(message) {
        alert(message);
    }
    
    populateDetailError(message) {
        document.getElementById('story-detail').innerHTML = generateDetailErrorTemplate(message);
    }

    showMapLoading() {
        document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }

    hideMapLoading() {
        document.getElementById('map-loading-container').innerHTML = '';
    }

    showDetailLoading() {
        document.getElementById("story-detail-loading-container").innerHTML =
        generateLoaderAbsoluteTemplate();
    }

    hideDetailLoading() {
        document.getElementById("story-detail-loading-container").innerHTML = "";
    }
    
}