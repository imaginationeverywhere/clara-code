#!/usr/bin/env bash
# Quik Nation repo layout helper — bash only (source from launchers).
#
# Layout:  <QN_NATIVE_ROOT>/AI/quik-nation-ai-boilerplate  (= QN_BOILERPLATE)
#          <QN_NATIVE_ROOT>/clients/...
#          <QN_NATIVE_ROOT>/Quik-Nation/...
#
# Call: qn_set_roots_from_boilerplate "/path/to/quik-nation-ai-boilerplate"
#
qn_set_roots_from_boilerplate() {
	QN_BOILERPLATE="$(cd "$1" && pwd)"
	QN_NATIVE_ROOT="$(cd "${QN_BOILERPLATE}/../.." && pwd)"
}

# Team → absolute repo path (same layout as agent-aliases / swarm-launcher)
qn_team_project_path() {
	local t
	t=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
	case "$t" in
	hq) echo "${QN_BOILERPLATE}" ;;
	pkgs) echo "${QN_NATIVE_ROOT}/AI/auset-packages" ;;
	wcr) echo "${QN_NATIVE_ROOT}/clients/world-cup-ready" ;;
	qn) echo "${QN_NATIVE_ROOT}/Quik-Nation/quiknation" ;;
	qcr) echo "${QN_NATIVE_ROOT}/Quik-Nation/quikcarrental" ;;
	fmo) echo "${QN_NATIVE_ROOT}/clients/fmo" ;;
	st) echo "${QN_NATIVE_ROOT}/clients/seeking-talent" ;;
	s962 | 962) echo "${QN_NATIVE_ROOT}/Quik-Nation/site962" ;;
	slk | slack) echo "${QN_NATIVE_ROOT}/Quik-Nation/sliplink" ;;
	qcarry) echo "${QN_NATIVE_ROOT}/Quik-Nation/quikcarry" ;;
	devops) echo "${QN_NATIVE_ROOT}/AI/quik-nation-devops" ;;
	trackit) echo "${QN_NATIVE_ROOT}/clients/trackit" ;;
	pgcmc) echo "${QN_NATIVE_ROOT}/clients/new-pgcmc-website-and-app" ;;
	*) echo "" ;;
	esac
}
