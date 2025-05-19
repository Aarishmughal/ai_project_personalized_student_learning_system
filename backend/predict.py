import sys
import json
import joblib
import numpy as np
import pandas as pd

# Load model
model = joblib.load('../python/math_model.pkl')

# Read input JSON from stdin
data = json.loads(sys.stdin.read())

# Preprocess: compute average score
data['average_score'] = np.mean([data['reading score'], data['writing score']])

# Wrap in a DataFrame
df = pd.DataFrame([data])

# Predict
pred = model.predict(df)[0]
print(json.dumps({"prediction": pred}))
