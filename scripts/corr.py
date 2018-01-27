import numpy as np
from sklearn.decomposition import PCA
import pandas as pd
import json

values = []

with open('./results-lines.json') as f:
  for line in f:
    values.append(json.loads(line))

df = pd.DataFrame(values)

genres_dummies = pd.Series(df['genres']).str.get_dummies(sep="-")
language_dummies = pd.Series(df['original_language']).str.get_dummies()

df_num = df[['adult', 'budget', 'popularity', 'revenue', 'runtime', 'vote_average']]

merged_first = df_num.merge(genres_dummies, left_index=True, right_index=True)
merged_total = merged_first.merge(language_dummies, left_index=True, right_index=True)

corr = merged_total.corr()['revenue']
