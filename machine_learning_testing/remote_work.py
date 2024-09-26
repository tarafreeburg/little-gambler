import numpy as np
import pandas as pd
from math import sqrt

from sklearn.preprocessing import StandardScaler

from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

from sklearn.model_selection import GridSearchCV #to find good parameters

from sklearn.preprocessing import LabelEncoder #NOTE: got from chatGPT, allow scikit learn to create new column in table to transform 'Employment_Type' into numeric values to use for classification

#load data
productivity = pd.read_csv('productivity.csv')
print(productivity.columns) #prints out the column
print(productivity.head(35)) #prints out sample of 35

#creates standard scaler
scaler = StandardScaler() #normally z-score based, test with min/max later

#create LabelEncoder to make non-numeric values numeric NOTE: Got from chatGPT
label_encoder = LabelEncoder()

#don't need employeeID as it's just a counter. 
productivity = productivity.drop(['Employee_ID'], axis = 1) #removes column 'Employee_ID' (axis=1 means the column)

X = productivity[['Hours_Worked_Per_Week', 'Productivity_Score', 'Well_Being_Score']] #TODO: test regression models with the different scores
X_scaled = scaler.fit_transform(X)

productivity['Employement_Type_Numeric'] = label_encoder.fit_transform(productivity['Employment_Type']) #makes numeric employement_type column so we can use


y = productivity[['Employement_Type_Numeric']] #NOTE: If get errors change 'In-Office' to False and 'Remote' to True



#*********************************** K-Nearest Neighbors ******************************************************
print("\n\n***************************** K Nearest Neighbors *******************************\n")

#basic KNN setup
basicKNN = KNeighborsClassifier()
basicKNN.fit(X_scaled, np.ravel(y))

print("Basic KNN Score: ")
print(basicKNN.score(X_scaled, np.ravel(y)))
print("\n")





#knn param grid
param_knn_grid = {
        'n_neighbors': [2, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20],
        'p': [1, 2, 3, 4, 5, 6, 7]
}


knn_grid = KNeighborsClassifier(metric = 'minkowski')

grid_search_knn = GridSearchCV(estimator = knn_grid, param_grid=param_knn_grid)

grid_search_knn.fit(X_scaled, np.ravel(y))

best_params_knn = grid_search_knn.best_params_
best_score_knn = grid_search_knn.best_score_

print("KNN Param Grid best outcome:")
print(best_params_knn)
print(best_score_knn)
print("\n\n")




#************************************* Linear Discriminant Analysis *****************************************
print("******************************* Linear Discriminant Analysis ************************************\n")
#LinearDiscriminate Basic
productivityLDA_Basic = LinearDiscriminantAnalysis()
productivityLDA_Basic.fit(X_scaled, np.ravel(y))

print("Basic LDA Score:")
print(productivityLDA_Basic.score(X_scaled, np.ravel(y)))
print("\n")


#LDA param grid
param_lda_grid = {
        'solver': ['lsqr', 'eigen'], #different solvers NOTE: 'svd' ISN'T HERE OTHERWISE IT WOULD CAUSE WARNINGS AS IT CAN'T USE SHRINKAGE. default is 'SVD' so we should already get an idea what it would be from the basic test
        'shrinkage': [None, 'auto', .1, .2, .25, .33, .5, .66, .75, .9, 1]
}

lda_grid = LinearDiscriminantAnalysis()

grid_search_lda = GridSearchCV(estimator = lda_grid, param_grid = param_lda_grid)

grid_search_lda.fit(X_scaled, np.ravel(y))

best_params_lda = grid_search_lda.best_params_
best_score_lda = grid_search_lda.best_score_

print("LDA Best Outcome: ")
print(best_params_lda)
print(best_score_lda)
print("\n")



#********************************** Gaussian NB **********************************************************
print("**************************** Gaussian NB *****************************\n")
#GaussianNB Basic
productivityGNB_Basic = GaussianNB()
productivityGNB_Basic.fit(X_scaled, np.ravel(y))

print("GaussianNB Basic Score: ")
print(productivityGNB_Basic.score(X_scaled, np.ravel(y)))
print("\n")


#GaussianNB Param Grid
param_GNB_grid = {
        'var_smoothing': [1e-9, 1e-8, 1e-7, 1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1, 1e2, 1e4, 1e5, 1e10, 1e20]
}

GNB_grid = GaussianNB()

grid_search_GNB = GridSearchCV(estimator = GNB_grid, param_grid = param_GNB_grid)

grid_search_GNB.fit(X_scaled, np.ravel(y))
best_params_GNB = grid_search_GNB.best_params_
best_score_GNB = grid_search_GNB.best_score_

print("GaussianNB Best Outcome: ")
print(best_params_GNB)
print(best_score_GNB)
