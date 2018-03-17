const Vue = require('vue/dist/vue')
const electron = require('electron')
const currentWindow = electron.remote.getCurrentWindow()

new Vue({
    el: '#app',
    data() {
        return {
            snippets: [],
            autoLaunch: currentWindow.preferencesManager.getCurrentState(),
        }
    },
    watch: {
        snippets: {
            handler() {
                currentWindow.snippetsManager.updateSnippets(this.snippets)
            },
            deep: true,
        },
        autoLaunch() {
            if (this.autoLaunch === true) {
                currentWindow.preferencesManager.enableAutoLaunch()
            } else {
                currentWindow.preferencesManager.disableAutoLaunch()
            }
        },
    },
    methods: {
        contextMenu(e) {
            e.preventDefault()

            electron.remote.Menu.buildFromTemplate([
                { label: 'Undo', role: 'undo' },
                { label: 'Redo', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', role: 'cut' },
                { label: 'Copy', role: 'copy' },
                { label: 'Paste', role: 'paste' },
                { label: 'Select All', role: 'selectAll' },
            ]).popup(currentWindow)
        },
        select(snippet) {
            if (snippet.selected) {
                return snippet.selected = false
            }

            this.unselectAll()

            this.selectNext(snippet)
        },
        selectNext(snippet) {
            snippet.selected = ! snippet.selected
        },
        unselectAll() {
            this.snippets.forEach(snippet => snippet.selected = false)
        },
        add() {
            this.snippets.push({
                key: '',
                value:'',
                selected: false,
            })
        },
        remove() {
            this.snippets = this.snippets.filter(snippet => ! snippet.selected)
        },
        escapeHandler(e) {
            if (e.key === 'Escape') {
                this.unselectAll()
            }
        },
        showPopup(e, snippet) {
            currentWindow.showPopup(e.target.offsetTop - this.$refs.rows.scrollTop, snippet)
        },
    },
    mounted() {
        this.snippets = currentWindow.snippetsManager.snippets

        document.addEventListener('keyup', this.escapeHandler)
    },
    unmounted() {
        document.removeEventListener('keyup', this.escapeHandler)
    },
})
