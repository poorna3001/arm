import pandas as pd
from sqlalchemy import create_engine
import os

# 1. Connect to your database
DB_URI = "postgresql://postgres:root@localhost:5432/readiness_db"
engine = create_engine(DB_URI)

print("Starting Database Import...")

# --- IMPORT 1: PO Records (For Transactions) ---
csv_file_1 = 'PO_PRICE_HIGHER_CONTRACT.csv'
if os.path.exists(csv_file_1):
    print(f"Reading {csv_file_1}...")
    df1 = pd.read_csv(csv_file_1)
    df1['Date of Creation'] = pd.to_datetime(df1['Date of Creation'], dayfirst=True, errors='coerce')
    print("Importing PO Data into PostgreSQL...")
    df1.to_sql('po_records', engine, if_exists='replace', index=False)
    print("✅ PO Records imported successfully.")
else:
    print(f"⚠️ Could not find {csv_file_1}")

# --- IMPORT 2: RCM Manufacturing Config (For LRS Control Tests) ---
csv_file_2 = 'CompleteRcm_Manufacturing v1.xlsx'
if os.path.exists(csv_file_2):
    print(f"Reading {csv_file_2}...")
    df2 = pd.read_excel(csv_file_2)
    print("Importing RCM Data into PostgreSQL...")
    df2.to_sql('rcm_config', engine, if_exists='replace', index=False)
    print("✅ RCM Config imported successfully.")
else:
    print(f"⚠️ Could not find {csv_file_2}")

print("🎉 Database setup complete! You can now start app.py")