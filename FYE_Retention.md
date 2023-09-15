---
title: Predicting First-Year Retention?
layout: page
menu: main
tags: 
- Neural Network
- Machine Learning
- TensorFlow
- SciKitLearn
- Probability
- Prediction
- First-Year Retention
---

<img src="/FYE_Retention/neural_net.png" width=360>
<br><br>

# Can a belonging survey & a neural network predict first-year student retention?  
<br>

<hr class="has-background-black">

## Executive Summary: Enhancing Student Retention with Predictive Analytics

Colleges and universities recognize the paramount importance of first-to-second year student retention for sustaining consistent revenue streams. In a dynamic higher education landscape, institutions must proactively engage with students during their time on campus to prevent attrition. However, these interventions come at a real-world cost, emphasizing the need for efficient allocation of resources. To achieve this, accurate prediction of which students are most likely to leave is crucial.

Traditional probability-based models fall short of providing actionable insights. This is where our neural network model shines, exhibiting a predictive power approximately 10% superior to demographic-based probability estimates. One critical factor in this success lies in the quality of the data utilized; focusing on the most predictive features yields significantly improved results. While further enhancements to the model are feasible, they largely depend on acquiring additional data relating to known retention factors such as financial aid status, mid-term academic performance, etc. Fortunately, ongoing data collection efforts offer the opportunity to validate our initial findings. Should these results withstand scrutiny, we stand poised to compile a list of at-risk students who are still on campus, presenting prime targets for timely and effective interventions. It may also be useful to build individual profiles for the students predicted to depart from the university. Such profiles may help university staff to tailor thier intervention efforts to suit each individual student.

In summary, our data-driven approach to student retention not only outperforms traditional methods but also holds the promise of transformative impact. By harnessing the power of predictive analytics and refining our data sources, we can bolster student success, bolster institutional stability, and secure a brighter future for both students and the institution.

#### Actionable Insights from this Project:
-   Predicting student behavior is extremely difficult; proceed with caution
-   Improving the quality of the data is hugely influential.
-   Building the survey with the analysis in mind is a best practice; keep iterating the survey.
-   This kind of data almost forces a model to overfit; knowing when to quit tuning is key.
-   Is the data from a belonging survey usefully predictive? **It Depends...**

## The Process

#### Cleaning the Data

[Build_Retention_Dataset.ipynb](FYE_Retention/Build_Retention_Dataset.ipynb)

There were two distinct phases to this work: data repair and dealing with null values. Both of these issues point toward issues with the survey itself.

Data repair consisted of using other datasets to determine the identity of students based on bad ID numbers. The students' names & email addresses were used to locate the correct ID numbers. These ID numbers were critical because they are used to determine whether a student was retained for the following Fall semester. Some of this work was not easily automated and had to be done by hand.

Much of the remaining cleaning came down to dealing with null values. Since the survey did not require students to complete all of the questions, there were numerous rows where values were simply missing. Since the dataset encompassed more than 80% of the students in the group to be studied, the fact that we lost 7% of the data through this first round of cleaning still leaves us with a highly-representative sample size.

All data was converted to numeric values since that is what the Neural Network requires.

#### Predictive Modeling with Probability Alone
There is a clear difference between *identifying* the relative probability rates of student retention for different groups and *predicting* which individual students will depart. And that difference is fairly simple to calculate.

 [Demographics-Prob_Model.ipynb](FYE_Retention/Demographics-Prob_Model.ipynb)


 If we only look at the question that asks if the student is the first generation in their family to attend college we learn that 18% of the students are indeed "First Gen" college students, and we also learn that they are 7% less likely to be retained at the university a year later:

 **First Year Retention for First-Gen Students:**
 - First-Gen: 72%
 - Not First-Gen: 79%

 That seems like a fairly significant difference, but it does not lead to an actionable prediction. 

 When we take this 72% retention rate and use it to try to predict which of the First-Gen students in the test-batch would actually come back the next year the results were unimpressive to say the least:
|First Gen: 104  | Pred. Stay | Pred. Leave |
| -------------- | ---------- | ----------- |
|**Actual Stay** | 53         | 26          |
|**Actual Leave**| 14         | 11          |

**The "in the wild" accuracy of the prediction is only 61.5%!** Of the 25 first-gen students in this population who actually left, this algorithm only predicted 11 of them.

The accuracy for the non-first-gen students was a little higher at 67%, which pulls the average predictive accuracy for this survey question up to 65%, but we are still not too far from coin-flipping.

This pattern holds for pretty much all of the probabilities generated from studying demographic factors alone. 

Since the random splitting of the samples introduces some noise into the predictions, it is helpful to run this algorithm say 100 times, with a different randomly-split population each time, and then average the predictive accuracy results:

<figure>
  <img src="/assets/images/FYE_NN/demographic_prob_alone.png" alt="demographic probability" class="eighty_pct">
  <figcaption>Fig. 1 - Average accumulated accuracy of demographic probabilities over 100 iterations</figcaption>
</figure>

This chart shows that some of the demographic questions were significantly *less* predictive; a student's gender, or whether or not they lived on campus offered essentially no predictive power.

But the *best* questions perform no better than "probability alone," which is simply applying the overall retention rate of the population as a predictive tool. That is to say, none of these demographic questions are helping us to accurately predict who will stay and who will leave.

In fact we can achieve a 75% accuracy rate, which beats any of the above attempts at precision, by simply guessing "Stay" in every instance:

|Guessing 'Stay' | Pred. Stay | Pred. Leave |
| -------------- | ---------- | ----------- |
|**Actual Stay** | 353        | 0           |
|**Actual Leave**| 118        | 0           |

Of course, this would be a useless approach if what we are looking to do is to identify which students are likely to leave so that we can intervene in some way.

**All of this makes it clear that predicting student behavior using probability alone is significantly harder than it might appear at first glance!**

### Experimenting with Logistic Regression

Since we are looking to determine the answer to a binary question: Will they stay, or will they go, we are clearly in the terrain of logistic regression. This is an approach that is specifically attuned to taking multiple signals and creating predictions base on the combination of the signals.

- Link to notebook

SciKitLearn has a well-developed algorithm for performing logistic regression analysis. And with a decision-threshold set at 0.5, the results look like this:

|Log.Regression  | Pred. Stay | Pred. Leave |
| -------------- | ---------- | ----------- |
|**Actual Stay** | 352        | 5           |
|**Actual Leave**| 112        | 2           |

At this point the algorithm is little different from just guessing "stay" every time. If we play with the decision-threshold we can see something interesting happen:

<figure>
  <img src="/assets/images/FYE_NN/LogReg.png" alt="logistic regression" class="eighty_pct">
  <figcaption>Fig. 2 - Logistic regression outcomes over the full range of decision thresholds</figcaption>
</figure>

On the left side we are seeing an approach that equates to "Guess stay every time," and on the right you see "Guess leave every time. The zone in between is naturally where things get interesting. If you "tune" this algorithm you can get to a point where you are catching more of the "leaves than you are missing.

|Threshold: 0.79 | Pred. Stay | Pred. Leave |
| -------------- | ---------- | ----------- |
|**Actual Stay** | 186        | 171         |
|**Actual Leave**| 49         | 65          |

On the one hand this is great because we are catching more "leaves" than we are missing, but in doing so we are predicting that nearly half of our students will leave, and so nearly 3/4 of the students we will be reaching out to will be wasted interventions! The overall accuracy of this model is only 53%!

### Time for a Neural Network!

Thus far we have not really engaged with the data from the survey that attempts to get at the students' sense of belonging, and a neural network is a highly appropriate tool for running binary classification on that kind of data. The data is subjective, but that does not mean that we cannot attempt to pull objecive trends out of that data; Netflix does this all the time!

- Link to Notebook

The first model was set up as follows:
- 58 input features
- 64 nodes in the first Dense layer
- 8 nodes in the second Dense layer
- A final layer with one node

The results were predictably useless:

<figure>
  <img src="/assets/images/FYE_NN/TF_raw_1.png" alt="neural net 1" class="eighty_pct">
  <figcaption>Fig. 3 - A portrait in overfitting</figcaption>
</figure>

The loss figure for the training set descends nicely and the accuracy rating for the training set hits a perfect 100% after around 200 epochs. But the loss for the validation set goes through the roof, and the accuracy stagnates. Classic overfitting.

- Link to notebook

After a great deal of experimentation, the following changes were made:
- The top 15 "most predictive" feature inputs were identified and only those features were fed  into the model
- The number of nodes in the first layer was reduced to 8
- L2 & Dropout regularization was applied to the first two layers
- The number of training epochs was reduced from 1000 to 100, which was the point where the validation loss seemed to hit its lowest point.

These changes made a clear difference:

<figure>
  <img src="/assets/images/FYE_NN/TF_best_1.png" alt="neural net 2" class="eighty_pct">
  <figcaption>Fig. 4 - Better?</figcaption>
</figure>

The loss rating for the validation set now descends roughly inline with the loss for the training set, and the accuracy ratings are similarly inline.

We can also tune the decision threshold for the final sigmoid classification, but this requires something of a judgment-call:

<figure>
  <img src="/assets/images/FYE_NN/TF_best_3.png" alt="neural net 13" class="eighty_pct">
  <figcaption>Fig. 4 - Deciding Where the Decision Happens</figcaption>
</figure>

If we want to make sure we catch *all* of the students who will be departing, we can set the threshold quite high, but we will be swamped with false-negative predictions. A decision threshold of 0.5 or lower has the opposite problem. 

With the threshold set at 0.71, the number of false-positives & false-negatives balances out:

|Threshold: 0.71 | Pred. Stay | Pred. Leave |
| -------------- | ---------- | ----------- |
|**Actual Stay** | 294        | 70          |
|**Actual Leave**| 72         | 35          |

At this point, the model's predictive accuracy is right at about 70%, which is a good bit better than just raw probability alone (61.4%). 


## The Upshot

There is a clear problem here. Our goal was not to create the most accurate model possible, our goal was to create a model to help us to identify the students most at risk of leaving. Two-thirds of the students on our predicted-to-leave list wind up staying, and this model completely mis-predicts two-thirds of the students who will leave. 

At this point, the best performing version of this model that reliably generates a list that includes ~1/3 of the students, and I can say with confidence that 1/2 of the students who will not be retained will be on that list...

In other words, that list will have an efficiency rating of ~35% in terms of targeting students who are likely to leave. This is nearly twice as effective as simply using raw probability, but since there would be a real-world cost associated with any student intervention that seeks to increase the odds of their staying at the university, the low-efficiency rating here is a real problem.


### Knowing When to Quit
Andrew Ng (aka: The Godfather of Machine Learning) has frequently pointed out that when it comes to machine learning, tuning will only get you so far, and your time might be better spend sourcing higher-quality data rather than experimenting endlessly with tuning parameters. (Source)

At the end of the day, it would seem as if knowing something about a student's sense of belonging is at best a weak predictor of their retention status, much as I hate to admit it. "Belonging" is THE hot buzzword in the field of Student Development these days, but this above analysis shows that if our goal is to keep our students, our efforts might have greater impact if we look elsewhere.



## Introduction
First to second year student retention has become the Holy Grail of higher education. With the population of college-bound students dwindling, colleges & universities must operate with greater efficiency. Recruiting new students costs money in terms of staffing, publicity, and then orienting those students once they arrive. Losing a percentage of those same students only a semester or two later is a form of waste that most schools are heavily focused on reducing.

Strategies for targeting "at risk" students typically focus on demographic factors such as ethnicity, age, & whether a student represents the first-generation in their family to attend college. These categories are easy to track and it is relatively easy to identify which sub-groups are more or less likely to leave early. Yet effective solutions to the first-year retention problem remain elusive.

This project explores some of the reasons behind this problem. Using survey data from approximately 50% of the First Year Students at a fairly typical comprehensive regional university, I will explore multiple methods for using this data to identify which students are most likely to depart after only one year. The data from this survey contains standard demographic datapoints, but also contains a series of questions that attempt to study the sense of belonging experienced by each student as well. 

Three different approaches to predicting student retention will be explored here:
- Probability alone
- Logistic Regression (using SciKitLearn)
- Neural Networks (using TensorFlow)

## The Data

The data used in this project was gleaned from a survey that all of the First Year students enrolled in UST 1000: Learning in Community, which is a First-Year experience course offered at the University of Minnesota Duluth (UMD). A subsequent database query of those same individuals was run to determine which of those students returned to UMD the subsequent fall and were thus "retained."

The survey consisted of a series of demographic questions followed by 20+ questions that all sought to get at different aspects of a student's sense of belonging. These questions were answered using a 5-point likert scale.