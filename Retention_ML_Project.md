---
title: Can a Neural Network & a Belonging Survey Predict First-Year Student Retention?
layout: page
menu: main
---

<img src="/assets/neural_net.png" width=360>
<br><br>
#### Actionable Insights from this Project:

-   Retention surprises

<hr class="has-background-black">

## Introduction

#### Context
First to second year student retention has become the Holy Grail of Higher Education. Two generations ago, universities would boast of their "wash out" rates as an indicaiton of their quality ("Look left, look right, only one of the three of you will be graduating four years from now..."), now schools invest enormous amounts of time and attention to keep as many of those First Year students as they possibly can. And any strategy that can improve a university's "retention rate" tends to get the attention of high-level administrators.

Strategies for targeting "at risk" students abound as do the theories of how best to help those students once targeted, yet the tide has yet to turn, despite the increased attention. Part of the problem here has to do with the timing and methods for targeting the students who are likely to leave the university. Most targeting methods focus on either demographic characteristics such as race, gender, or income level; or they focus on academic performance, such as High School GPA, test scores, or first semester college grades. 

None of these methods directly account for one of the primary reasons why students leave: they just don't feel like they belong. Low academic performance in the first semester of college is as likely to be the result of a lack of social adhesion to the campus as it is an indication of academic ability, and the demographic characteristics that correlate with low First-Year retention numbers are rarely interrogated for their underlying causal factors: students coming to universities optimized for the comfort of upper-middle-class white students often feel like outsiders, and their sense of social adhesion suffers. In short, they don't feel as if they "belong."


#### The Proposition

What if we could identify students whose sense of belonging was already beginning to fall behind during their first month at the university? What if we could specifically target the students least-likely to return the following Fall during a period when their view of the university was still highly malleable?

What makes one student feel as if they belong tends to be as idiosyncratic as the students themselves. There are clearly trends, but claiming to understand "kids today" is obviously a dubious claim. But what if you could predict who would stay and who would go, without really understanding the reasons why? Just knowing with some precision which students might be most likely to depart would at least allow a university to target its resources most effectively, and that alone might be worth tens of thousands of dollars to the perpetually sagging bottom line of most university budgets.


#### The Project
Neural networks are a fabulous solution when you have a variety of data points that all seem to be pertinent to a predictive question, but you are not sure HOW pertinent they are individually. Using machine learning techniques to determine the relative predictive weights of data points can provide a useful degree of predictive power.

For this project the neural networks will be use a logistic regression model to predict which students are likely to depart from the university within the first year. In order to minimize the number of "false-negative" results (students who would be classified as "staying" but whom would actually leave), we will be locating the classification boundary closer to the "leaving" end of the spectrum. This will naturally result in an increased number of false-positive results, and the impact of that will have to be studied subsequently.

We can also run this same model to assess students' likelihood of departing at the end of the first semester. Students flagged under this model might be considered higher-priority and might require different services.



#### The Data


