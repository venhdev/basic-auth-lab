up:
	docker compose up -d
down:
	docker compose down
db-shell:
	docker compose exec postgres psql -U lab auth_lab
logs:
	docker compose logs -f
restart:
	docker compose restart
