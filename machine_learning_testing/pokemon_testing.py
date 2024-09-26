#just some code to test that I can create a machine learning program locally
#might also be used as a template for future programs
#this is basically just going to be recreating assignment #2 from CSC722

import numpy as np
import pandas as pd

from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler #scaling data, useful for KNN and others. usually not a bad idea to do so


#load in stuff
pokemon = pd.read_csv('pokemon.csv')
print("\n\nInformation what's in the csv file:")
print(pokemon.columns)

print("Sample output of first 35 items:")
print("\n\n", pokemon.head(35))

#setting up standard scaler
scaler = StandardScaler() #by default uses z-score, can change to use min/max. might be useful to test

X = pokemon[['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']]#input features
X_scaled = scaler.fit_transform(X)#scales X 

y = pokemon[['Legendary']] #output feature
y_array = np.ravel(y)

KNN = KNeighborsClassifier(n_neighbors = 5) #default neighbors is 5. good guess is sqrt of data we have

KNN.fit(X_scaled, y_array)
print(KNN.score(X_scaled, y)) #NOTE: this is scoring with same data set we are fitting with, not good, should use other data
