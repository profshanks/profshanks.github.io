import pandas as pd
import numpy as np
import panel as pn
pn.extension('tabulator')

import hvplot.pandas
import holoviews as hv
from holoviews import opts
hv.extension('bokeh')

select_countries = ['Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 
                    'Colombia', 'Egypt', 'France', 'Germany', 'India', 'Indonesia', 'Iran', 'Iraq', 'Italy', 'Japan', 
                    'Kazakhstan', 'Malaysia', 'Mexico', 'Netherlands', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines', 
                    'Poland', 'Romania', 'Russia', 'Saudi Arabia', 'South Africa', 'South Korea', 'Spain', 
                    'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 
                    'United States', 'Venezuela', 'Vietnam']
continents = ['World', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania']
all_select = select_countries + continents

select = pd.read_csv('select_countries.csv')

select_order = ['World', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania', 
                'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 
                'China', 'Colombia', 'Egypt', 'France', 'Germany', 'India', 'Indonesia', 'Iran', 'Iraq', 'Italy', 'Japan', 
                'Kazakhstan', 'Malaysia', 'Mexico', 'Netherlands', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines', 
                'Poland', 'Romania', 'Russia', 'Saudi Arabia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 
                'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Venezuela', 'Vietnam']


# Some minor data preprocessing

select = select.set_index('country').loc[select_order].reset_index()

# Make Dataframe Pipeline Interactive
idf = select.interactive()

# CO2 emission over time by continent

# Define Panel widgets
year_slider = pn.widgets.IntSlider(name='Year slider', start=1750, end=2015, step=5, value=2015)

# Radio buttons for CO2 measures
yaxis_co2 = pn.widgets.RadioButtonGroup(
    name='Y axis',
    options=['co2', 'co2_per_capita'],
    button_type='success'
)

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


co2_plot = co2_pipeline.hvplot(x = 'year', by='country', y=yaxis_co2, line_width=2, title="CO2 Emissions by Continent")
co2_plot = co2_plot.opts(toolbar=None)

# CO2 emission over time by continent

filtered_data = co2_pipeline[co2_pipeline.year == year_slider]

tabulator_formatters = {
    'year': {'type': 'plaintext'}
}

co2_table = filtered_data.pipe(pn.widgets.Tabulator, 
                               pagination='remote', 
                               page_size = 10, 
                               sizing_mode='stretch_width',
                               show_index=False,
                               formatters=tabulator_formatters) 
# CO2 vs GDP scatterplot

# Radio buttons for Scatterplot
scatter_select = pn.widgets.RadioButtonGroup(
    name='country_select',
    options=['All Nations', 'Minus Big 5'],
    button_type='success'
)

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


yaxis_co2_source = pn.widgets.RadioButtonGroup(
    name='Y axis', 
    options=['co2', 'coal_co2', 'oil_co2', 'gas_co2'], 
    button_type='success'
)

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

co2_vs_gdp_scatterplot = co2_vs_gdp_scatterplot_pipeline.hvplot(x='gdp_per_capita', 
                                                                y=yaxis_co2_source, 
                                                                by='country', 
                                                                size=80, kind="scatter", 
                                                                alpha=0.7,
                                                                legend=False,
                                                                title="Emissions by Country")

co2_vs_gdp_scatterplot = co2_vs_gdp_scatterplot.opts(toolbar=None)

# Bar chart with CO2 sources by continent

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

co2_source_bar_plot = co2_source_bar_pipeline.hvplot(kind='bar', 
                                                     x='country', 
                                                     y=yaxis_co2_source, 
                                                     title='CO2 source by continent',
                                                     height=400,
                                                     rot=45)
co2_source_bar_plot = co2_source_bar_plot.opts(toolbar=None)

# Creating the dashboard

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
                           co2_plot.panel(width=500), margin=(0,10)), 
                 co2_table.panel(width=350)), 
          pn.Row(pn.Column(yaxis_co2_source, co2_vs_gdp_scatterplot.panel(width=450), margin=(0,10)), 
                 pn.Column(co2_source_bar_plot.panel(width=400)))],
    accent_base_color="#2f474a",
    header_background="#6d021b"
)

template.servable();
