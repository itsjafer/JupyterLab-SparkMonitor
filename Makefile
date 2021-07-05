.PHONY: all
all: clean build develop

.PHONY: venv
venv: requirements-dev.txt tox.ini
	# install python dependencies
	tox -e venv
	# install npm dependencies
	venv/bin/jlpm install
	. venv/bin/activate

.PHONY: build
build: venv
	venv/bin/jlpm build
	venv/bin/pip install -I .

develop:
	ipython profile create --ipython-dir=.ipython
	echo "c.InteractiveShellApp.extensions.append('sparkmonitor.kernelextension')" >>  .ipython/profile_default/ipython_config.py
	IPYTHONDIR=.ipython venv/bin/jupyter lab --watch

.PHONY: clean
clean:
	rm -rf venv
	rm -rf node_modules
	rm -rf .ipython
	rm -rf lib

.PHONY: lint
lint: frontend-build
	venv/bin/jlpm run eslint

dist: build
	rm -rf dist/
	venv/bin/python setup.py bdist_wheel

.PHONY: itest
itest: dist
	docker build --tag itsjafer/sparkmonitor:itest --build-arg VERSION=$$(venv/bin/python setup.py --version) .
	docker run --rm -p 8888:8888 -p 4040:4040 -e JUPYTER_ENABLE_LAB=yes itsjafer/sparkmonitor:itest
