import { App, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

type TlpClassification = 'white' | 'green' | 'amber' | 'amberStrict' | 'red';

interface TlpValueSettings {
	white: string;
	green: string;
	amber: string;
	amberStrict: string;
	red: string;
}

interface PluginSettings {
	useFrontmatterHighlight: boolean;
	usePathHighlight: boolean;
	frontmatterAttribute: string;
	tlpValues: TlpValueSettings;
	pathToHighlight: string;
	uiElementToHighlight: string;
}

const TLP_CLASSIFICATIONS: TlpClassification[] = ['white', 'green', 'amber', 'amberStrict', 'red'];

const DEFAULT_TLP_VALUES: TlpValueSettings = {
	white: 'WHITE',
	green: 'GREEN',
	amber: 'AMBER',
	amberStrict: 'AMBER:STRICT',
	red: 'RED',
};

const DEFAULT_SETTINGS: PluginSettings = {
	useFrontmatterHighlight: true,
	usePathHighlight: false,
	frontmatterAttribute: 'classification',
	tlpValues: { ...DEFAULT_TLP_VALUES },
	pathToHighlight: '',
	uiElementToHighlight: 'titlebar',
};

const HIGHLIGHT_CLASSNAMES = ['tlp-highlight', 'tlp-highlight-light', ...TLP_CLASSIFICATIONS.map((level) => `tlp-${level}`)];

export default class HighlightpublicnotesPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();
		const { workspace } = this.app
		this.registerEvent(workspace.on('file-open', this.onFileOpen, this))
		this.addSettingTab(new SettingTab(this.app, this));
	}

	async onFileOpen(file: TFile) {
		if (!file || file.extension !== 'md')
      		return;

		if(this.settings.usePathHighlight) {
			if (this.checkPath(file.path, this.settings.pathToHighlight)) {
				this.highlightNote('red')
			} else {
				this.unhighlightNote()
				// if not in higlighte path check classifiedFrontmatter
				this.higlightClassifiedFrontmatterFile(file)
			}
		} else if(this.settings.useFrontmatterHighlight) {
			// if no path hilighting check for frontmatter highlighting
			this.higlightClassifiedFrontmatterFile(file)
		}

		
	}

	private higlightClassifiedFrontmatterFile(file: TFile) {
		const classification = this.app.metadataCache.getFileCache(file)?.frontmatter?.[this.settings.frontmatterAttribute]
		const tlpLevel = this.resolveTlpLevel(classification)
		if (tlpLevel) {
			this.highlightNote(tlpLevel)
		} else {
			this.unhighlightNote()
		}
	}

	private resolveTlpLevel(value: unknown): TlpClassification | null {
		if (!value) {
			return null
		}
		const normalized = value.toString().trim().toLowerCase()
		for (const level of TLP_CLASSIFICATIONS) {
			const configuredValue = this.settings.tlpValues[level]
			if (configuredValue && normalized === configuredValue.trim().toLowerCase()) {
				return level
			}
		}
		return null
	}

	private highlightNote(level: TlpClassification) {
		const highlightTarget = this.getUiElement()
		if (!highlightTarget) {
			return
		}
		highlightTarget.classList.remove(...HIGHLIGHT_CLASSNAMES)
		const baseClass = this.settings.uiElementToHighlight === 'titlebar' ? 'tlp-highlight' : 'tlp-highlight-light'
		highlightTarget.classList.add(baseClass, `tlp-${level}`)
	}

	private unhighlightNote() {
			const highlightTarget = this.getUiElement()
			if (!highlightTarget) {
				return
			}
			highlightTarget.classList.remove(...HIGHLIGHT_CLASSNAMES)
	}

	private checkPath(currentPath: string, blacklistedPath: string): boolean {
		return currentPath.includes(blacklistedPath)
	}

	private getUiElement(): HTMLElement | undefined {
		return document.getElementsByClassName(this.settings.uiElementToHighlight)[0] as HTMLElement | undefined
	}

	async loadSettings() {
		const loadedData = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
		this.settings.tlpValues = Object.assign({}, DEFAULT_TLP_VALUES, loadedData?.tlpValues);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: HighlightpublicnotesPlugin;

	constructor(app: App, plugin: HighlightpublicnotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;
		
		containerEl.empty()

		new Setting(containerEl)
			.setName('Object to highlight')
			.setDesc('Either select the titlebar, the header or the content.')
			.addDropdown(dropdown =>   
				{
					return dropdown
						.addOption("titlebar", "Titlebar")
						.addOption("view-header", "Header")
						.addOption("view-content", "Content")
						.setValue(this.plugin.settings.uiElementToHighlight)
						.onChange((value) => {
							this.plugin.settings.uiElementToHighlight = value;
							this.plugin.saveSettings();
						});
				})


		new Setting(containerEl)
			.setName('check frontmatter')
			.setDesc('use frontmatter highlighting')
			.addToggle(toogle => {
				toogle
				.setValue(this.plugin.settings.useFrontmatterHighlight)
				.onChange(async _ => {
					this.plugin.settings.useFrontmatterHighlight = !this.plugin.settings.useFrontmatterHighlight
					await this.plugin.saveSettings()
					this.display()
				})
			})
		
		new Setting(containerEl)
			.setName('check path')
			.setDesc('use path highlighting')
			.addToggle(toogle => {
				toogle
				.setValue(this.plugin.settings.usePathHighlight)
				.onChange(async _ => {
					this.plugin.settings.usePathHighlight = !this.plugin.settings.usePathHighlight
					await this.plugin.saveSettings()
					this.display()
				})
		})

		if (this.plugin.settings.useFrontmatterHighlight) {
			this.addFrontMatterSettings(containerEl)
			this.addTlpSettings(containerEl)
		}
        if (this.plugin.settings.usePathHighlight) {
            this.addPathHighlightSettings(containerEl)
        }

		
		
	}


    addPathHighlightSettings(container: HTMLElement): void {
        container.createEl('h3', {
            text: "Path Highlight Settings"
        })
        new Setting(container)
			.setName('Path')
			.setDesc('a path to highlight')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.pathToHighlight)
				.onChange(async (value) => {
					this.plugin.settings.pathToHighlight = value
					await this.plugin.saveSettings()
				}))
    }

	addFrontMatterSettings(container: HTMLElement): void {
        container.createEl('h3', {
            text: "Frontmatter Settings"
        })
        new Setting(container)
			.setName('Attribute')
			.setDesc('the attribute in the frontmatter that indicates the visiblity')
			.addText(text => text
				.setPlaceholder('classification')
				.setValue(this.plugin.settings.frontmatterAttribute)
				.onChange(async (value) => {
					this.plugin.settings.frontmatterAttribute = value
					await this.plugin.saveSettings()
				}))
			
       
       }

	addTlpSettings(container: HTMLElement): void {
		container.createEl('h3', {
			text: "TLP Classification Settings"
		})
		container.createEl('p', {
			text: "Define which frontmatter values map to the individual TLP levels."
		})

		const prettyNames: Record<TlpClassification, string> = {
			white: 'WHITE',
			green: 'GREEN',
			amber: 'AMBER',
			amberStrict: 'AMBER:STRICT',
			red: 'RED',
		}

		for (const level of TLP_CLASSIFICATIONS) {
			new Setting(container)
				.setName(prettyNames[level])
				.setDesc(`Set the exact text the plugin should match for TLP ${prettyNames[level]}.`)
				.addText(text => text
					.setPlaceholder(prettyNames[level])
					.setValue(this.plugin.settings.tlpValues[level])
					.onChange(async (value) => {
						this.plugin.settings.tlpValues[level] = value || prettyNames[level]
						await this.plugin.saveSettings()
					}))
		}
	}
}
