from datetime import datetime

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

token = "yxCYhp_0BmOzZlhb5OSs2hJU6hfNlA2AcxreA7W-Ti9m1OKQOXBBKBLasGgS0NiXsQBTbAASJfa132I0eEYJKg=="
org = "SITHS Solar Car"
bucket = "2021 Failemetry 2.0"

client = InfluxDBClient(
    url="https://us-east-1-1.aws.cloud2.influxdata.com", token=token)

write_api = client.write_api(write_options=SYNCHRONOUS)

point = Point("mem") \
    .tag("host", "host1") \
    .field("used_percent", 23.43234543) \
    .time(datetime.utcnow(), WritePrecision.NS)

write_api.write(bucket, org, point)
