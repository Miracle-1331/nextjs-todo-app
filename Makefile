IMAGE ?= nextjs-todo-app:local
SEVERITY ?= HIGH,CRITICAL

.PHONY: build scan validate clean

build:
	docker build -t $(IMAGE) .

# Scan the local image — mirrors exactly what CI does before pushing.
# Fails on HIGH/CRITICAL fixable vulnerabilities (exit code 1).
scan: build
	trivy image \
		--severity $(SEVERITY) \
		--ignore-unfixed \
		--exit-code 1 \
		$(IMAGE)

# Full local validation: build + scan.
# Run this before pushing a Dockerfile change to confirm CI will pass.
validate: scan
	@echo "✓ Image $(IMAGE) passed trivy scan"

clean:
	docker rmi $(IMAGE) 2>/dev/null || true
