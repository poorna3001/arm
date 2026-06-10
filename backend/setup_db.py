import pandas as pd
from sqlalchemy import create_engine

# 1. Connect to your database
# Make sure to replace 'yourpassword' with your actual pgAdmin password!
DB_URI = "postgresql://postgres:root@localhost:5432/readiness_db"
engine = create_engine(DB_URI)

# 2. Read the CSV file
csv_file = 'PO_PRICE_HIGHER_CONTRACT.csv'
print(f"Reading {csv_file}...")
df = pd.read_csv(csv_file)

# Optional: Clean up the Date column just like we do in app.py before sending to SQL
df['Date of Creation'] = pd.to_datetime(df['Date of Creation'], dayfirst=True, errors='coerce')

# 3. Automatically create the table and import the data!
print("Importing data into PostgreSQL. This might take a few seconds...")
# if_exists='replace' will create a fresh table for us
df.to_sql('po_records', engine, if_exists='replace', index=False)

print("✅ Success! Your PostgreSQL database is fully loaded and ready.")