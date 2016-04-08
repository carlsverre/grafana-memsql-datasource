run-memsql:
	docker run -d --name memsql memsql/quickstart

storage:
	docker volume rm grafana-storage || true
	docker volume create --name grafana-storage


dev:
	grunt
	docker build -t grafana/memsql .
	docker run --rm --name grafana -v grafana-storage:/var/lib/grafana -v $(PWD):/plugins/memsql grafana/memsql
