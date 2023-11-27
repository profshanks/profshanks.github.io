importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.4/pyc/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/1.2.3/dist/wheels/bokeh-3.1.1-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.2.3/dist/wheels/panel-1.2.3-py3-none-any.whl', 'pyodide-http==0.2.1', 'holoviews', 'hvplot', 'numpy', 'pandas']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import numpy as np
import panel as pn
pn.extension('tabulator')

from holoviews import opts

import hvplot.pandas


# In[2]:


import holoviews as hv
hv.extension('bokeh')


# In[15]:


select_countries = ['Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 
                    'Colombia', 'Egypt', 'France', 'Germany', 'India', 'Indonesia', 'Iran', 'Iraq', 'Italy', 'Japan', 
                    'Kazakhstan', 'Malaysia', 'Mexico', 'Netherlands', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines', 
                    'Poland', 'Romania', 'Russia', 'Saudi Arabia', 'South Africa', 'South Korea', 'Spain', 
                    'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 
                    'United States', 'Venezuela', 'Vietnam']
continents = ['World', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania']
all_select = select_countries + continents


# In[3]:


select = pd.read_csv('select_countries.csv')
select.shape


# In[8]:


select_order = ['World', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania', 
                'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 
                'China', 'Colombia', 'Egypt', 'France', 'Germany', 'India', 'Indonesia', 'Iran', 'Iraq', 'Italy', 'Japan', 
                'Kazakhstan', 'Malaysia', 'Mexico', 'Netherlands', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines', 
                'Poland', 'Romania', 'Russia', 'Saudi Arabia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 
                'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Venezuela', 'Vietnam']


# # Some minor data preprocessing

# In[10]:


select = select.set_index('country').loc[select_order].reset_index()
select


# In[11]:


# Make Dataframe Pipeline Interactive
idf = select.interactive()


# # CO2 emission over time by continent

# In[12]:


# Define Panel widgets
year_slider = pn.widgets.IntSlider(name='Year slider', start=1750, end=2015, step=5, value=2015)
year_slider


# In[13]:


# Radio buttons for CO2 measures
yaxis_co2 = pn.widgets.RadioButtonGroup(
    name='Y axis',
    options=['co2', 'co2_per_capita'],
    button_type='success'
)


# In[16]:


#continents = ['World', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania', 'Antarctica']

co2_pipeline = (
    idf[
        (idf.country.isin(continents) &
        (idf.year <= year_slider))
    ]
    .groupby(['country', 'year'])[yaxis_co2].mean()
    .to_frame()
    .reset_index()
    .sort_values(by='year')
    .reset_index(drop=True)
)


# In[17]:


co2_pipeline


# In[18]:


co2_plot = co2_pipeline.hvplot(x = 'year', by='country', y=yaxis_co2, line_width=2, title="CO2 Emissions by Continent")
co2_plot = co2_plot.opts(toolbar=None)
co2_plot


# # CO2 emission over time by continent

# In[19]:


filtered_data = co2_pipeline[co2_pipeline.year == year_slider]


# In[20]:


tabulator_formatters = {
    'year': {'type': 'plaintext'}
}

co2_table = filtered_data.pipe(pn.widgets.Tabulator, 
                               pagination='remote', 
                               page_size = 10, 
                               show_index=False,
                               formatters=tabulator_formatters) 
co2_table


# # CO2 vs GDP scatterplot

# # Radio buttons for Scatterplot
# scatter_select = pn.widgets.RadioButtonGroup(
#     name='country_select',
#     options=['All Nations', 'Minus Big 5'],
#     button_type='success'
# )

# In[21]:


just_countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Anguilla', 'Antigua and Barbuda', 'Argentina', 
                      'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 
                      'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bonaire Sint Eustatius and Saba', 'Bosnia and Herzegovina', 
                      'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 
                      'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Colombia', 'Comoros', 'Congo', 'Cook Islands', 
                      'Costa Rica', "Cote d'Ivoire", 'Croatia', 'Cuba', 'Curacao', 'Cyprus', 'Czechia', 'Democratic Republic of Congo', 'Denmark', 'Djibouti', 
                      'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 
                      'Faeroe Islands', 'Fiji', 'Finland', 
                      'France', 'French Equatorial Africa', 'French Guiana', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 
                      'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 
                      'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 
                      'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 
                      'Leeward Islands', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',  
                      'Luxembourg', 'Macao', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 
                      'Mauritius', 'Mayotte', 'Mexico', 'Micronesia (country)', 'Moldova', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 
                      'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue',  
                      'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 
                      'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion', 
                      'Romania', 'Russia', 'Rwanda', 'Ryukyu Islands', 'Saint Helena', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Pierre and Miquelon', 
                      'Saint Vincent and the Grenadines', 'Samoa', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 
                      'Singapore', 'Sint Maarten (Dutch part)', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 
                      'South Sudan', 'Spain', 'Sri Lanka', 'St. Kitts-Nevis-Anguilla', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 
                      'Tanzania', 'Thailand', 'Timor', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 
                      'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 
                      'Vanuatu', 'Venezuela', 'Vietnam', 'Wallis and Futuna', 'Yemen', 'Zambia', 'Zimbabwe']


# In[22]:


yaxis_co2_source = pn.widgets.RadioButtonGroup(
    name='Y axis', 
    options=['co2', 'coal_co2', 'oil_co2', 'gas_co2'], 
    button_type='success'
)


# In[23]:


co2_vs_gdp_scatterplot_pipeline = (
    idf[
        (idf.year == year_slider) &
        (idf.country.isin(select_countries)) &
        (~ (idf.gdp_per_capita > 65000))
    ]
    .groupby(['country', 'year', 'gdp_per_capita'])[yaxis_co2_source].mean()
    .to_frame()
    .reset_index()
    .sort_values(by='year')  
    .reset_index(drop=True)
)


# In[24]:


co2_vs_gdp_scatterplot = co2_vs_gdp_scatterplot_pipeline.hvplot(x='gdp_per_capita', 
                                                                y=yaxis_co2_source, 
                                                                by='country', 
                                                                size=80, kind="scatter", 
                                                                alpha=0.7,
                                                                legend=False,
                                                                title="Emissions by Country")

co2_vs_gdp_scatterplot = co2_vs_gdp_scatterplot.opts(toolbar=None)
co2_vs_gdp_scatterplot


# # Bar chart with CO2 sources by continent

# In[25]:


co2_source_bar_pipeline = (
    idf[
        (idf.year == year_slider) &
        (idf.country.isin(continents))
    ]
    .groupby(['year', 'country'])[yaxis_co2_source].sum()
    .to_frame()
    .reset_index()
    .sort_values(by='year')  
    .reset_index(drop=True)
)


# In[26]:


print(type(co2_source_bar_pipeline))


# In[27]:


co2_source_bar_plot = co2_source_bar_pipeline.hvplot(kind='bar', 
                                                     x='country', 
                                                     y=yaxis_co2_source, 
                                                     title='CO2 source by continent',
                                                     height=400,
                                                     rot=45)
co2_source_bar_plot = co2_source_bar_plot.opts(toolbar=None)
co2_source_bar_plot


# # Creating the dashboard

# In[28]:


# Building the dashboard

# Define the CSS for the sidebar
css = """
.sidenav {
    background-color: #D3D3D3;  /* Light gray background */
}
.pn-wrapper {
    background-color: #E3E3E3;  /* Lighter gray background */
}
"""

# Append the CSS to the Panel configuration
pn.config.raw_css.append(css)

#Layout using Template
template = pn.template.FastListTemplate(
    title='Global CO2 Emissions Dashboard', 
    sidebar=[pn.pane.PNG('hot_earth.png', sizing_mode='scale_width'),
             pn.pane.Markdown("# Who is Generating the CO2 Emissions?"), 
             pn.pane.Markdown("## Select the Year"),
             year_slider,
             pn.pane.Markdown('#### Carbon dioxide emissions are the primary driver of global climate change. '
                              'But determining who is responsible for this problem and how to analyze the impact of '
                              'each nation\'s contribution is not always easy. This dashboard enables casual users '
                              'to explore the individual contributions of nations & contenents over time. Be playful; '
                              'see what you might learn!'), 
             ],
    main=[pn.Row(pn.Column(yaxis_co2, 
                           co2_plot.panel(sizing_mode='fixed', width=500, height=300), margin=(0,10)), 
                           co2_table.panel(sizing_mode='fixed', width=350, height=300)), 
          pn.Row(pn.Column(yaxis_co2_source, co2_vs_gdp_scatterplot.panel(sizing_mode='fixed', width=450, height=300), margin=(0,10)), 
                 pn.Column(co2_source_bar_plot.panel(sizing_mode='fixed', width=400, height=300)))],
    accent_base_color="#2f474a",
    header_background="#6d021b"
)

# template.show()
template.servable();


# In[ ]:






await write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    state.curdoc.apply_json_patch(patch.to_py(), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()