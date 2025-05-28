import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sentence_transformers import SentenceTransformer
import joblib

# Load dataset
df = pd.read_csv("udemy_courses.csv")

# Clean/prepare basic fields
df['price'] = df['price'].replace('Free', '0').str.replace('$', '').astype(float)
df.dropna(subset=['course_title', 'subject'], inplace=True)

# For now, simulate user data by using course title as proxy for interest
df['interest_text'] = df['course_title']  # Simulate interests for now

# Use sentence transformer to embed interest text
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
df['interest_embedding'] = df['interest_text'].apply(lambda x: embedding_model.encode(x))

# Expand embeddings to columns
embeddings_df = pd.DataFrame(df['interest_embedding'].to_list())
df = pd.concat([df.reset_index(drop=True), embeddings_df], axis=1)

# Target: subject (e.g., Business, Web Dev, etc.)
y = df['subject']
X = df.drop(columns=['subject', 'course_id', 'course_title', 'url', 'interest_text', 'interest_embedding'])

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train classifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# Save model and transformer
joblib.dump(clf, 'course_recommender_model.pkl')
joblib.dump(embedding_model, 'text_embedding_model.pkl')
